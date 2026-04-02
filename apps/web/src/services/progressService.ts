import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import type { Tables, TablesInsert } from '../shared/types/database.types'

export type ProgressMode = 'read' | 'practice' | 'test' | 'challenge'

// クエリで SELECT する列のみを含む型（id は SELECT しないため除外）
type StepProgressRow = Pick<
  Tables<'step_progress'>,
  'user_id' | 'step_id' | 'read_done' | 'practice_done' | 'test_done' | 'challenge_done' | 'updated_at' | 'completed_at'
>

type ProgressPatch = Partial<
  Pick<StepProgressRow, 'read_done' | 'practice_done' | 'test_done' | 'challenge_done' | 'completed_at'>
>

export async function getAllStepProgress(userId: string): Promise<StepProgressRow[]> {
  const { data, error } = await supabase
    .from('step_progress')
    .select('user_id, step_id, read_done, practice_done, test_done, challenge_done, updated_at, completed_at')
    .eq('user_id', userId)

  if (error) {
    throw fromSupabaseError(error, '学習進捗の取得に失敗しました')
  }

  return data
}

export async function getStepProgress(userId: string, stepId: string): Promise<StepProgressRow | null> {
  const { data, error } = await supabase
    .from('step_progress')
    .select('user_id, step_id, read_done, practice_done, test_done, challenge_done, updated_at, completed_at')
    .eq('user_id', userId)
    .eq('step_id', stepId)
    .maybeSingle()

  if (error) {
    throw fromSupabaseError(error, '学習進捗の取得に失敗しました')
  }

  return data
}

export async function upsertProgress(userId: string, stepId: string, patch: ProgressPatch) {
  const payload: TablesInsert<'step_progress'> = {
    user_id: userId,
    step_id: stepId,
    ...patch,
  }

  const { error } = await supabase.from('step_progress').upsert(payload, {
    onConflict: 'user_id,step_id',
    ignoreDuplicates: false,
  })

  if (error) {
    throw fromSupabaseError(error, '学習進捗の保存に失敗しました')
  }
}

export async function updateModeCompletion(userId: string, stepId: string, mode: ProgressMode) {
  let patch: ProgressPatch
  switch (mode) {
    case 'read':
      patch = { read_done: true }
      break
    case 'practice':
      patch = { practice_done: true }
      break
    case 'test':
      patch = { test_done: true }
      break
    case 'challenge':
      patch = { challenge_done: true }
      break
    default: {
      const _exhaustive: never = mode
      throw new Error(`Unknown mode: ${_exhaustive}`)
    }
  }

  await upsertProgress(userId, stepId, patch)
}

/** 4モード（read / practice / test / challenge）すべて完了しているか判定する純粋関数 */
export function isStepCompleted(progress: {
  read_done: boolean
  practice_done: boolean
  test_done: boolean
  challenge_done: boolean
}): boolean {
  return progress.read_done && progress.practice_done && progress.test_done && progress.challenge_done
}

export async function getCompletedStepCount(userId: string) {
  const { data, error } = await supabase
    .from('step_progress')
    .select('read_done, practice_done, test_done, challenge_done')
    .eq('user_id', userId)

  if (error) {
    throw fromSupabaseError(error, '完了ステップ数の取得に失敗しました')
  }

  const completed = (data ?? []).filter(
    (row) => row.read_done && row.practice_done && row.test_done && row.challenge_done,
  )

  return completed.length
}
