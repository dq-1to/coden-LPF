import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import { assertMaxLength } from '../shared/validation'
import type { Tables, TablesInsert } from '../shared/types/database.types'

const MAX_CODE_LENGTH = 50_000
const MAX_SUBMISSION_LIMIT = 100

export type ChallengeSubmission = Pick<
  Tables<'challenge_submissions'>,
  'id' | 'user_id' | 'step_id' | 'code' | 'is_passed' | 'matched_keywords' | 'submitted_at'
>

export type CreateChallengeSubmissionInput = Pick<
  TablesInsert<'challenge_submissions'>,
  'user_id' | 'step_id' | 'code' | 'is_passed' | 'matched_keywords'
>

export async function createChallengeSubmission(
  input: CreateChallengeSubmissionInput,
): Promise<ChallengeSubmission> {
  assertMaxLength(input.code, MAX_CODE_LENGTH, 'code')
  const { data, error } = await supabase
    .from('challenge_submissions')
    .insert(input)
    .select('id, user_id, step_id, code, is_passed, matched_keywords, submitted_at')
    .single()

  if (error) {
    throw fromSupabaseError(error, 'Challenge の提出履歴保存に失敗しました')
  }

  return data
}

export async function getRecentChallengeSubmissions(
  userId: string,
  stepId: string,
  limit = 5,
): Promise<ChallengeSubmission[]> {
  const safeLimit = Math.min(Math.max(1, limit), MAX_SUBMISSION_LIMIT)
  const { data, error } = await supabase
    .from('challenge_submissions')
    .select('id, user_id, step_id, code, is_passed, matched_keywords, submitted_at')
    .eq('user_id', userId)
    .eq('step_id', stepId)
    .order('submitted_at', { ascending: false })
    .limit(safeLimit)

  if (error) {
    throw fromSupabaseError(error, 'Challenge の提出履歴取得に失敗しました')
  }

  return data ?? []
}
