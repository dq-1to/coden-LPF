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

type ReviewItemState = Pick<ReviewItem, 'id' | 'status'>

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
    .select('id, status')
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
  // 誤答は stage を問わず stage 0 / 即日 due へ戻す。
  // 新規行の初期スケジュールなので、クライアント時刻でも SRS の進行判定には影響しない。
  const nextReviewAt = new Date().toISOString()
  const payload: TablesInsert<'review_items'> = {
    user_id: input.userId,
    step_id: input.stepId,
    mode: input.mode,
    question_id: questionId,
    expected,
    user_input: userInput,
    status: 'open',
    resolved_at: null,
    review_stage: 0,
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
      review_stage: 0,
      next_review_at: nextReviewAt,
      last_reviewed_at: nextReviewAt,
    })
    return
  }

  await insertReviewItem(payload)
}

/**
 * 正解時の段階進行。期日判定・stage 遷移・行ロックはすべて DB 側の RPC が行う。
 * SRS の間隔（翌日 / 3日後 / 7日後）は 033 の SQL を正本とし、ここでは複製しない。
 */
export async function recordCorrectAnswer(target: ReviewTarget): Promise<void> {
  validateTarget(target)

  const { error } = await supabase.rpc('advance_review_item_if_due', {
    p_step_id: target.stepId,
    p_mode: target.mode,
    p_question_id: normalizeQuestionId(target.questionId),
  })

  if (error) {
    throw fromSupabaseError(error, '復習アイテムの更新に失敗しました')
  }
}

/**
 * 既存 review item のスケジュールだけを stage 0 / 即日 due へ戻す。
 * Daily で出題された Practice/Test 由来 item を再誤答時に戻す用途で使う。
 * expected / user_input は上書きしない。
 */
export async function resetReviewItemSchedule(target: ReviewTarget): Promise<void> {
  validateTarget(target)

  const { error } = await supabase.rpc('reset_review_item_schedule', {
    p_step_id: target.stepId,
    p_mode: target.mode,
    p_question_id: normalizeQuestionId(target.questionId),
  })

  if (error) {
    throw fromSupabaseError(error, '復習アイテムの更新に失敗しました')
  }
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
