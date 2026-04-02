import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import type { Tables } from '../shared/types/database.types'
import { POINT_MILESTONES } from '../shared/constants'

export type LearningStats = Pick<
  Tables<'learning_stats'>,
  'user_id' | 'total_points' | 'current_streak' | 'max_streak' | 'last_study_date'
>

export interface HeatmapCell {
  date: string
  count: number
  level: number
}

export interface PointGoalProgress {
  current: number
  target: number
  percent: number
}

function toDateStringUtc(date: Date): string {
  const [datePart] = date.toISOString().split('T')
  return datePart ?? ''
}

function createDefaultLearningStats(userId: string): LearningStats {
  return {
    user_id: userId,
    total_points: 0,
    current_streak: 0,
    max_streak: 0,
    last_study_date: null,
  }
}

function toHeatmapLevel(count: number): number {
  if (count >= 3) return 3
  if (count === 2) return 2
  if (count === 1) return 1
  return 0
}

function buildDateRange(days: number, now = new Date()): string[] {
  const safeDays = Math.max(1, days)
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const dateRange: string[] = []

  for (let offset = safeDays - 1; offset >= 0; offset -= 1) {
    const date = new Date(base)
    date.setUTCDate(base.getUTCDate() - offset)
    dateRange.push(toDateStringUtc(date))
  }

  return dateRange
}

export async function getLearningStats(userId: string): Promise<LearningStats> {
  const { data, error } = await supabase
    .from('learning_stats')
    .select('user_id, total_points, current_streak, max_streak, last_study_date')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw fromSupabaseError(error, '学習統計の取得に失敗しました')
  }

  return data ?? createDefaultLearningStats(userId)
}

export function applyStudyActivity(stats: LearningStats, now = new Date()): LearningStats {
  const nextStats = { ...stats }
  const todayDateStr = toDateStringUtc(now)
  const yesterday = new Date(now)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayDateStr = toDateStringUtc(yesterday)

  if (stats.last_study_date === todayDateStr) {
    return nextStats
  }

  if (stats.last_study_date === yesterdayDateStr) {
    nextStats.current_streak += 1
  } else {
    nextStats.current_streak = 1
  }

  nextStats.last_study_date = todayDateStr
  if (nextStats.current_streak > nextStats.max_streak) {
    nextStats.max_streak = nextStats.current_streak
  }

  return nextStats
}

export async function recordStudyActivity(): Promise<void> {
  const { error } = await supabase.rpc('record_study_activity')

  if (error) {
    throw fromSupabaseError(error, '学習記録の保存に失敗しました')
  }
}

export async function getLearningHeatmap(userId: string, days = 30): Promise<HeatmapCell[]> {
  const dateRange = buildDateRange(days)
  const startDate = dateRange[0]

  const { data, error } = await supabase
    .from('point_history')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', `${startDate}T00:00:00.000Z`)

  if (error) {
    throw fromSupabaseError(error, 'ヒートマップデータの取得に失敗しました')
  }

  const dateCountMap = new Map<string, number>()
  for (const row of data ?? []) {
    const createdAt = typeof row.created_at === 'string' ? row.created_at : ''
    const dateKey = createdAt.slice(0, 10)
    if (!dateKey) {
      continue
    }
    dateCountMap.set(dateKey, (dateCountMap.get(dateKey) ?? 0) + 1)
  }

  return dateRange.map((date) => {
    const count = dateCountMap.get(date) ?? 0
    return {
      date,
      count,
      level: toHeatmapLevel(count),
    }
  })
}

export function calculatePointGoalProgress(totalPoints: number): PointGoalProgress {
  const milestones = [...POINT_MILESTONES]
  const safePoints = Math.max(0, totalPoints)

  let nextThreshold = Math.ceil((safePoints + 1) / 500) * 500
  for (const threshold of milestones) {
    if (threshold > safePoints) {
      nextThreshold = threshold
      break
    }
  }

  let previousThreshold = 0
  for (const threshold of milestones) {
    if (threshold <= safePoints) {
      previousThreshold = threshold
    }
  }

  const target = Math.max(1, nextThreshold - previousThreshold)
  const current = Math.max(0, safePoints - previousThreshold)
  const percent = Math.min(100, Math.max(0, Math.round((current / target) * 100)))

  return { current, target, percent }
}

export function countMonthlyStudyDays(heatmap: HeatmapCell[], now = new Date()): number {
  const monthPrefix = toDateStringUtc(now).slice(0, 7)
  return heatmap.filter((cell) => cell.date.startsWith(monthPrefix) && cell.count > 0).length
}
