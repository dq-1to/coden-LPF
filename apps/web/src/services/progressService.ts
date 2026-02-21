import { supabase } from '../lib/supabaseClient'

export type ProgressMode = 'read' | 'practice' | 'test' | 'challenge'

interface StepProgressRow {
  user_id: string
  step_id: string
  read_done: boolean
  practice_done: boolean
  test_done: boolean
  challenge_done: boolean
  updated_at?: string
  completed_at?: string | null
}

type ProgressPatch = Partial<
  Pick<StepProgressRow, 'read_done' | 'practice_done' | 'test_done' | 'challenge_done' | 'completed_at'>
>

export async function getAllStepProgress(userId: string): Promise<StepProgressRow[]> {
  const { data, error } = await supabase
    .from('step_progress')
    .select('user_id, step_id, read_done, practice_done, test_done, challenge_done, updated_at, completed_at')
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  return data as StepProgressRow[]
}

export async function getStepProgress(userId: string, stepId: string): Promise<StepProgressRow | null> {
  const { data, error } = await supabase
    .from('step_progress')
    .select('user_id, step_id, read_done, practice_done, test_done, challenge_done, updated_at, completed_at')
    .eq('user_id', userId)
    .eq('step_id', stepId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function upsertProgress(userId: string, stepId: string, patch: ProgressPatch) {
  const payload: Partial<StepProgressRow> = {
    user_id: userId,
    step_id: stepId,
    updated_at: new Date().toISOString(),
    ...patch,
  }

  const { error } = await supabase.from('step_progress').upsert(payload, {
    onConflict: 'user_id,step_id',
    ignoreDuplicates: false,
  })

  if (error) {
    throw error
  }
}

export async function updateModeCompletion(userId: string, stepId: string, mode: ProgressMode) {
  const patch: ProgressPatch = {}

  if (mode === 'read') {
    patch.read_done = true
  }
  if (mode === 'practice') {
    patch.practice_done = true
  }
  if (mode === 'test') {
    patch.test_done = true
  }
  if (mode === 'challenge') {
    patch.challenge_done = true
  }

  await upsertProgress(userId, stepId, patch)
}

export async function getCompletedStepCount(userId: string) {
  const { data, error } = await supabase
    .from('step_progress')
    .select('read_done, practice_done, test_done, challenge_done')
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  const completed = (data ?? []).filter(
    (row) => row.read_done && row.practice_done && row.test_done && row.challenge_done,
  )

  return completed.length
}
