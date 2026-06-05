import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import { assertMaxLength } from '../shared/validation'
import type { Tables } from '../shared/types/database.types'

export type ProfileRecord = Tables<'profiles'>
export type PointHistoryRecord = Tables<'point_history'>

export async function getProfile(userId: string): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, created_at, is_admin')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw fromSupabaseError(error, 'プロフィールの取得に失敗しました')
  }

  return data
}

const MAX_DISPLAY_NAME_LENGTH = 50

export async function upsertDisplayName(userId: string, displayName: string | null): Promise<void> {
  const normalizedName = displayName && displayName.trim().length > 0 ? displayName.trim() : null
  if (normalizedName) {
    assertMaxLength(normalizedName, MAX_DISPLAY_NAME_LENGTH, 'displayName')
  }
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      display_name: normalizedName,
    },
    { onConflict: 'id', ignoreDuplicates: false },
  )

  if (error) {
    throw fromSupabaseError(error, 'プロフィールの更新に失敗しました')
  }
}

export async function getPointHistory(userId: string, limit = 50): Promise<PointHistoryRecord[]> {
  const safeLimit = Math.max(1, Math.min(limit, 200))
  const { data, error } = await supabase
    .from('point_history')
    .select('id, user_id, amount, reason, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(safeLimit)

  if (error) {
    throw fromSupabaseError(error, 'ポイント履歴の取得に失敗しました')
  }

  return data ?? []
}
