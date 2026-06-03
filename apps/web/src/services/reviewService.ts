import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import { assertMaxLength, assertOneOf, assertPositiveInteger, assertUuid } from '../shared/validation'
import type { Tables, TablesInsert, TablesUpdate } from '../shared/types/database.types'

export type ReviewItem = Tables<'review_items'>
export type ReviewMode = ReviewItem['mode']
export type ReviewStatus = ReviewItem['status']

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

type ReviewItemId = Pick<ReviewItem, 'id'>

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

async function findReviewItemId(target: ReviewTarget): Promise<ReviewItemId | null> {
  const questionId = normalizeQuestionId(target.questionId)
  const query = supabase
    .from('review_items')
    .select('id')
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
  const payload: TablesInsert<'review_items'> = {
    user_id: input.userId,
    step_id: input.stepId,
    mode: input.mode,
    question_id: questionId,
    expected,
    user_input: userInput,
    status: 'open',
    resolved_at: null,
  }

  const existing = await findReviewItemId(input)
  if (existing) {
    await updateReviewItem(existing.id, {
      expected,
      user_input: userInput,
      status: 'open',
      resolved_at: null,
    })
    return
  }

  await insertReviewItem(payload)
}

export async function resolveReviewItem(target: ReviewTarget): Promise<void> {
  validateTarget(target)

  const existing = await findReviewItemId(target)
  if (!existing) {
    return
  }

  await updateReviewItem(existing.id, {
    status: 'resolved',
    resolved_at: new Date().toISOString(),
  })
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
    .select('id, user_id, step_id, mode, question_id, expected, user_input, status, created_at, resolved_at')
    .eq('user_id', userId)
    .eq('status', 'open')
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw fromSupabaseError(error, '復習キューの取得に失敗しました')
  }

  return data ?? []
}
