import { supabase } from '../lib/supabaseClient'

export interface ProfileRecord {
  id: string
  display_name: string | null
  created_at: string
}

export interface PointHistoryRecord {
  id: string
  user_id: string
  amount: number
  reason: string
  created_at: string
}

export async function getProfile(userId: string): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, created_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function upsertDisplayName(userId: string, displayName: string | null): Promise<void> {
  const normalizedName = displayName && displayName.trim().length > 0 ? displayName.trim() : null
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      display_name: normalizedName,
    },
    { onConflict: 'id', ignoreDuplicates: false },
  )

  if (error) {
    throw error
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
    throw error
  }

  return data ?? []
}
