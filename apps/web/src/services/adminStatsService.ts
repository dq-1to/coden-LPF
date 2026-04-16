/**
 * 管理者向け統計サービス
 *
 * 014_admin_stats_rpc.sql で定義された 3 つの RPC をラップする。
 * 加えて、シンプルに count / sum で済む集計は PostgREST を直接使う。
 * いずれも admin 用 RLS / RPC ガードで非 admin からの呼び出しは拒否される。
 */

import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'

export interface DauPoint {
  date: string // YYYY-MM-DD (JST)
  activeUsers: number
}

export interface StepCompletionRate {
  stepId: string
  totalUsers: number
  completedUsers: number
  completionRate: number // 0.0 - 1.0
}

export interface MissedQuestion {
  stepId: string
  attemptCount: number
  failureCount: number
  failureRate: number // 0.0 - 1.0
}

export interface GlobalStatsSummary {
  totalUsers: number
  totalPointsDistributed: number
  totalFeedback: number
  newFeedback: number
}

/** 過去 30 日分の DAU を取得（直近が末尾の昇順） */
export async function getDauLast30Days(): Promise<DauPoint[]> {
  const { data, error } = await supabase.rpc('get_dau_last_30_days')
  if (error) {
    throw fromSupabaseError(error, 'DAU の取得に失敗しました')
  }
  return (data ?? []).map((row) => ({
    date: row.activity_date,
    activeUsers: row.active_users,
  }))
}

/** ステップ別完了率（低い順） */
export async function getStepCompletionRates(): Promise<StepCompletionRate[]> {
  const { data, error } = await supabase.rpc('get_step_completion_rates')
  if (error) {
    throw fromSupabaseError(error, 'ステップ完了率の取得に失敗しました')
  }
  return (data ?? []).map((row) => ({
    stepId: row.step_id,
    totalUsers: row.total_users,
    completedUsers: row.completed_users,
    completionRate: Number(row.completion_rate),
  }))
}

/** 失敗率が高い問題 TOP N */
export async function getTopMissedQuestions(
  limit = 10,
  minAttempts = 3,
): Promise<MissedQuestion[]> {
  const safeLimit = Math.max(1, Math.min(limit, 100))
  const safeMin = Math.max(1, minAttempts)
  const { data, error } = await supabase.rpc('get_top_missed_questions', {
    p_limit: safeLimit,
    p_min_attempts: safeMin,
  })
  if (error) {
    throw fromSupabaseError(error, 'よく間違える問題の取得に失敗しました')
  }
  return (data ?? []).map((row) => ({
    stepId: row.step_id,
    attemptCount: row.attempt_count,
    failureCount: row.failure_count,
    failureRate: Number(row.failure_rate),
  }))
}

/** グローバルサマリー（ユーザー総数・総配布ポイント・フィードバック集計） */
export async function getGlobalStatsSummary(): Promise<GlobalStatsSummary> {
  const [usersRes, pointsRes, feedbackTotalRes, feedbackNewRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('point_history').select('amount'),
    supabase.from('user_feedback').select('*', { count: 'exact', head: true }),
    supabase.from('user_feedback').select('*', { count: 'exact', head: true }).eq('status', 'new'),
  ])

  if (usersRes.error) throw fromSupabaseError(usersRes.error, 'ユーザー総数の取得に失敗しました')
  if (pointsRes.error) throw fromSupabaseError(pointsRes.error, 'ポイント履歴の取得に失敗しました')
  if (feedbackTotalRes.error)
    throw fromSupabaseError(feedbackTotalRes.error, 'フィードバック件数の取得に失敗しました')
  if (feedbackNewRes.error)
    throw fromSupabaseError(feedbackNewRes.error, '新規フィードバック件数の取得に失敗しました')

  const totalPoints = (pointsRes.data ?? []).reduce((sum, row) => sum + (row.amount ?? 0), 0)

  return {
    totalUsers: usersRes.count ?? 0,
    totalPointsDistributed: totalPoints,
    totalFeedback: feedbackTotalRes.count ?? 0,
    newFeedback: feedbackNewRes.count ?? 0,
  }
}
