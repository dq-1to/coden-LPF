import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import { assertMaxLength, assertOneOf, assertPositiveInteger, assertUuid } from '../shared/validation'
import type { Tables, TablesInsert, TablesUpdate } from '../shared/types/database.types'

export type ReviewItem = Tables<'review_items'>
export type ReviewMode = ReviewItem['mode']
export type ReviewStatus = ReviewItem['status']
export type DailyReviewCandidate = Pick<
  ReviewItem,
  'id' | 'step_id' | 'mode' | 'question_id' | 'created_at'
>

const REVIEW_MODES = new Set<ReviewMode>(['practice', 'test', 'challenge', 'daily'])
const MAX_REVIEW_TEXT_LENGTH = 2000
/** 連続正解回数ごとの次回間隔（日）。index = 到達後の review_stage - 1 */
const REVIEW_INTERVAL_DAYS = [1, 3, 7] as const
/** 全段階クリアを表す stage */
const REVIEW_STAGE_COMPLETED = REVIEW_INTERVAL_DAYS.length + 1
const DAY_MS = 24 * 60 * 60 * 1000

export type ReviewSchedule = {
  reviewStage: number
  nextReviewAt: string | null
  status: ReviewStatus
}

export type ReviewTarget = {
  userId: string
  stepId: string
  mode: ReviewMode
  questionId?: string | null
}

export type RecordWrongAnswerInput = ReviewTarget & {
  expected?: string | null
  userInput?: string | null
}

type ReviewItemState = Pick<ReviewItem, 'id' | 'status' | 'review_stage'>

/**
 * 判定結果から次回の復習スケジュールを決める。
 * 誤答: stage 0 / 即日 due。正解: stage を 1 つ進め、最終段階を超えたら resolved。
 */
export function getNextReviewSchedule(
  currentStage: number,
  isCorrect: boolean,
  now: Date = new Date(),
): ReviewSchedule {
  if (!isCorrect) {
    return { reviewStage: 0, nextReviewAt: now.toISOString(), status: 'open' }
  }

  const nextStage = currentStage + 1
  if (nextStage >= REVIEW_STAGE_COMPLETED) {
    return {
      reviewStage: REVIEW_STAGE_COMPLETED,
      nextReviewAt: null,
      status: 'resolved',
    }
  }

  const intervalDays = REVIEW_INTERVAL_DAYS[nextStage - 1]
  if (intervalDays === undefined) {
    throw new RangeError(`未対応の復習 stage です: ${currentStage}`)
  }

  return {
    reviewStage: nextStage,
    nextReviewAt: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
    status: 'open',
  }
}

function normalizeQuestionId(questionId?: string | null): string | null {
  const normalized = questionId?.trim()
  return normalized ? normalized : null
}

function normalizeOptionalText(value?: string | null): string | null {
  return value ?? null
}

function validateTarget(target: ReviewTarget) {
  assertUuid(target.userId, 'userId')
  assertMaxLength(target.stepId, 120, 'stepId')
  assertOneOf(target.mode, REVIEW_MODES, 'mode')

  const questionId = normalizeQuestionId(target.questionId)
  if (questionId) {
    assertMaxLength(questionId, 160, 'questionId')
  }
}

function validateRecordInput(input: RecordWrongAnswerInput) {
  validateTarget(input)

  if (input.expected) {
    assertMaxLength(input.expected, MAX_REVIEW_TEXT_LENGTH, 'expected')
  }

  if (input.userInput) {
    assertMaxLength(input.userInput, MAX_REVIEW_TEXT_LENGTH, 'userInput')
  }
}

async function findReviewItemState(target: ReviewTarget): Promise<ReviewItemState | null> {
  const questionId = normalizeQuestionId(target.questionId)
  const query = supabase
    .from('review_items')
    .select('id, status, review_stage')
    .eq('user_id', target.userId)
    .eq('step_id', target.stepId)
    .eq('mode', target.mode)

  const filteredQuery = questionId ? query.eq('question_id', questionId) : query.is('question_id', null)
  const { data, error } = await filteredQuery.maybeSingle()

  if (error) {
    throw fromSupabaseError(error, '復習アイテムの取得に失敗しました')
  }

  return data
}

async function updateReviewItem(id: string, patch: TablesUpdate<'review_items'>) {
  const { error } = await supabase
    .from('review_items')
    .update(patch)
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) {
    throw fromSupabaseError(error, '復習アイテムの更新に失敗しました')
  }
}

async function insertReviewItem(payload: TablesInsert<'review_items'>) {
  const { error } = await supabase
    .from('review_items')
    .insert(payload)
    .select('id')
    .maybeSingle()

  if (error) {
    throw fromSupabaseError(error, '復習アイテムの保存に失敗しました')
  }
}

export async function recordWrongAnswer(input: RecordWrongAnswerInput): Promise<void> {
  validateRecordInput(input)

  const questionId = normalizeQuestionId(input.questionId)
  const expected = normalizeOptionalText(input.expected)
  const userInput = normalizeOptionalText(input.userInput)
  const schedule = getNextReviewSchedule(0, false)
  if (schedule.nextReviewAt === null) {
    throw new Error('誤答時の次回復習日時を計算できませんでした')
  }
  const nextReviewAt = schedule.nextReviewAt
  const payload: TablesInsert<'review_items'> = {
    user_id: input.userId,
    step_id: input.stepId,
    mode: input.mode,
    question_id: questionId,
    expected,
    user_input: userInput,
    status: 'open',
    resolved_at: null,
    review_stage: schedule.reviewStage,
    next_review_at: nextReviewAt,
    last_reviewed_at: nextReviewAt,
  }

  const existing = await findReviewItemState(input)
  if (existing) {
    await updateReviewItem(existing.id, {
      expected,
      user_input: userInput,
      status: 'open',
      resolved_at: null,
      review_stage: schedule.reviewStage,
      next_review_at: nextReviewAt,
      last_reviewed_at: nextReviewAt,
    })
    return
  }

  await insertReviewItem(payload)
}

export async function recordCorrectAnswer(target: ReviewTarget): Promise<void> {
  validateTarget(target)

  const existing = await findReviewItemState(target)
  if (!existing || existing.status !== 'open') {
    return
  }

  const now = new Date()
  const nowIso = now.toISOString()
  const schedule = getNextReviewSchedule(existing.review_stage, true, now)
  const patch: TablesUpdate<'review_items'> = {
    status: schedule.status,
    review_stage: schedule.reviewStage,
    last_reviewed_at: nowIso,
    resolved_at: schedule.status === 'resolved' ? nowIso : null,
  }

  if (schedule.nextReviewAt !== null) {
    patch.next_review_at = schedule.nextReviewAt
  }

  await updateReviewItem(existing.id, patch)
}

export async function getOpenCount(userId: string): Promise<number> {
  assertUuid(userId, 'userId')

  const { count, error } = await supabase
    .from('review_items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'open')

  if (error) {
    throw fromSupabaseError(error, '復習待ち件数の取得に失敗しました')
  }

  return count ?? 0
}

export async function listOpen(userId: string, limit = 10): Promise<ReviewItem[]> {
  assertUuid(userId, 'userId')
  assertPositiveInteger(limit, 'limit')

  const { data, error } = await supabase
    .from('review_items')
    .select('id, user_id, step_id, mode, question_id, expected, user_input, status, created_at, resolved_at, review_stage, next_review_at, last_reviewed_at')
    .eq('user_id', userId)
    .eq('status', 'open')
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw fromSupabaseError(error, '復習キューの取得に失敗しました')
  }

  return data ?? []
}

export async function listDue(
  userId: string,
  limit = 10,
  now: Date = new Date(),
): Promise<ReviewItem[]> {
  assertUuid(userId, 'userId')
  assertPositiveInteger(limit, 'limit')

  const { data, error } = await supabase
    .from('review_items')
    .select('id, user_id, step_id, mode, question_id, expected, user_input, status, created_at, resolved_at, review_stage, next_review_at, last_reviewed_at')
    .eq('user_id', userId)
    .eq('status', 'open')
    .lte('next_review_at', now.toISOString())
    .order('next_review_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw fromSupabaseError(error, '今日の復習の取得に失敗しました')
  }

  return data ?? []
}

export async function getDueCount(userId: string, now: Date = new Date()): Promise<number> {
  assertUuid(userId, 'userId')

  const { count, error } = await supabase
    .from('review_items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'open')
    .lte('next_review_at', now.toISOString())

  if (error) {
    throw fromSupabaseError(error, '今日の復習件数の取得に失敗しました')
  }

  return count ?? 0
}

export async function pickForDaily(
  userId: string,
  completedStepIds: ReadonlySet<string>,
  limit = 50,
): Promise<DailyReviewCandidate | null> {
  assertUuid(userId, 'userId')
  assertPositiveInteger(limit, 'limit')

  if (completedStepIds.size === 0) {
    return null
  }

  const items = await listDue(userId, limit)
  return items.find((item) => completedStepIds.has(item.step_id)) ?? null
}
