import { getAllSteps, findCourseById } from '../content/courseData'
import { BADGE_POINT_THRESHOLD_HIGH, BADGE_POINT_THRESHOLD_MID, STREAK_THRESHOLD_BRONZE, STREAK_THRESHOLD_GOLD, STREAK_THRESHOLD_SILVER } from '../shared/constants'
import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import type { Tables } from '../shared/types/database.types'
import { getAllStepProgress } from './progressService'
import { getLearningStats } from './statsService'
import { CODE_DOCTOR_PROBLEMS } from '../content/code-doctor/problems'

export type Achievement = Omit<Tables<'achievements'>, 'badge_id'> & { badge_id: BadgeId }

export const BADGE_DEFINITIONS = [
  { id: 'first-step', name: '最初の一歩', description: '初めてステップを完了した' },
  { id: 'first-challenge', name: '初チャレンジャー', description: '初めてチャレンジモードをクリアした' },
  { id: 'streak-3', name: '3日連続', description: '3日連続で学習した' },
  { id: 'streak-7', name: '週間学習者', description: '7日連続で学習した' },
  { id: 'streak-30', name: '継続の達人', description: '30日連続で学習した' },
  { id: 'course-1-complete', name: '基礎マスター', description: 'React基礎コースを完了した' },
  { id: 'course-2-complete', name: '応用習得者', description: 'React応用コースを完了した' },
  { id: 'course-3-complete', name: '実践者', description: 'React実践コースを完了した' },
  { id: 'course-4-complete', name: 'API連携マスター', description: 'API連携実践コースを完了した' },
  { id: 'ts-basic-complete', name: 'TypeScript入門者', description: 'TypeScript基礎コース全ステップを完了した' },
  { id: 'ts-react-complete', name: 'TS×Reactマスター', description: 'TypeScript × Reactコース全ステップを完了した' },
  { id: 'react-modern-complete', name: 'Reactモダンマスター', description: 'Reactモダンコース全ステップを完了した' },
  { id: 'patterns-complete', name: '実務パターン習得者', description: '実務パターンコース全ステップを完了した' },
  { id: 'all-complete', name: 'Coden完走者', description: '全20ステップを完了した' },
  { id: 'pt-500', name: '500Pt達成', description: '累計500Pt以上を獲得した' },
  { id: 'pt-1000', name: '1000Pt達成', description: '累計1000Pt以上を獲得した' },
  { id: 'daily-7', name: 'デイリー7日連続', description: '7日連続でデイリーチャレンジを完了した' },
  { id: 'daily-30', name: 'デイリー30日連続', description: '30日連続でデイリーチャレンジを完了した' },
  { id: 'doctor-10', name: 'コードドクター見習い', description: 'コードドクター10問を正解した' },
  { id: 'doctor-all-advanced', name: '名医', description: 'コードドクター上級を全問正解した' },
  { id: 'first-mini-project', name: '初プロジェクト', description: 'ミニプロジェクトを初めて完了した' },
  { id: 'mini-project-5', name: 'プロジェクトビルダー', description: 'ミニプロジェクトを5つ完了した' },
  { id: 'reader-10', name: 'コードリーダー', description: 'コードリーディングで合計10問以上正解した' },
] as const

export type BadgeId = (typeof BADGE_DEFINITIONS)[number]['id']

const BADGE_ID_SET = new Set<BadgeId>(BADGE_DEFINITIONS.map((badge) => badge.id))
// all-complete は全ステップ完了が条件なので未実装ステップも含む
const ALL_STEP_IDS = getAllSteps().map((step) => step.id)
const COURSE_COMPLETION_RULES: Array<{ badgeId: BadgeId; stepIds: string[] }> = [
  { badgeId: 'course-1-complete', stepIds: getCourseStepIds('react-fundamentals') },
  { badgeId: 'course-2-complete', stepIds: getCourseStepIds('react-hooks') },
  { badgeId: 'course-3-complete', stepIds: getCourseStepIds('react-advanced') },
  { badgeId: 'course-4-complete', stepIds: getCourseStepIds('react-api') },
  { badgeId: 'ts-basic-complete', stepIds: getCourseStepIds('ts-basics') },
  { badgeId: 'ts-react-complete', stepIds: getCourseStepIds('ts-react') },
  { badgeId: 'react-modern-complete', stepIds: getCourseStepIds('react-modern') },
  { badgeId: 'patterns-complete', stepIds: getCourseStepIds('react-patterns') },
]

const ADVANCED_DOCTOR_COUNT = CODE_DOCTOR_PROBLEMS.filter((p) => p.difficulty === 'advanced').length

function getCourseStepIds(courseId: string): string[] {
  // isImplemented: false のステップはバッジ判定対象外とし、未実装コースの誤解禁を防止する
  return (
    findCourseById(courseId)
      ?.steps.filter((step) => step.isImplemented)
      .map((step) => step.id) ?? []
  )
}

function isBadgeId(value: string): value is BadgeId {
  return BADGE_ID_SET.has(value as BadgeId)
}

function isStepCompleted(progress: {
  read_done: boolean
  practice_done: boolean
  test_done: boolean
  challenge_done: boolean
}) {
  return progress.read_done && progress.practice_done && progress.test_done && progress.challenge_done
}

// ─── DB ヘルパー関数 ──────────────────────────────────────

/** デイリーチャレンジの現在の連続完了日数を返す */
export async function getDailyStreakCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('daily_challenge_history')
    .select('challenge_date, completed')
    .eq('user_id', userId)

  if (error) throw fromSupabaseError(error, 'デイリー連続記録の取得に失敗しました')

  const completedDates = new Set(
    (data ?? []).filter((r) => r.completed).map((r) => r.challenge_date as string),
  )

  const now = new Date()
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  let streak = 0
  let d = new Date(jst.toISOString().slice(0, 10) + 'T00:00:00Z')

  while (completedDates.has(d.toISOString().slice(0, 10))) {
    streak++
    d = new Date(d.getTime() - 24 * 60 * 60 * 1000)
  }

  return streak
}

/** コードドクターの完了数（総計・上級）を返す */
export async function getCodeDoctorStats(
  userId: string,
): Promise<{ totalCompleted: number; advancedCompleted: number }> {
  const { data, error } = await supabase
    .from('code_doctor_progress')
    .select('problem_id, solved')
    .eq('user_id', userId)

  if (error) throw fromSupabaseError(error, 'コードドクター進捗の取得に失敗しました')

  const completedRows = (data ?? []).filter((r) => r.solved)
  const advancedIds = new Set(
    CODE_DOCTOR_PROBLEMS.filter((p) => p.difficulty === 'advanced').map((p) => p.id),
  )

  return {
    totalCompleted: completedRows.length,
    advancedCompleted: completedRows.filter((r) => advancedIds.has(r.problem_id)).length,
  }
}

/** 完了済みミニプロジェクト数を返す */
export async function getMiniProjectCompletedCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('mini_project_progress')
    .select('project_id, status')
    .eq('user_id', userId)

  if (error) throw fromSupabaseError(error, 'ミニプロジェクト進捗の取得に失敗しました')

  return (data ?? []).filter((r) => r.status === 'completed').length
}

/** コードリーディングの正解数合計を返す */
export async function getCodeReadingCorrectCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('code_reading_progress')
    .select('correct_count')
    .eq('user_id', userId)

  if (error) throw fromSupabaseError(error, 'コードリーディング進捗の取得に失敗しました')

  return (data ?? []).reduce((sum, row) => sum + ((row.correct_count as number) ?? 0), 0)
}

// ─── 実績サービス ─────────────────────────────────────────

export async function getUnlockedAchievements(userId: string): Promise<BadgeId[]> {
  const { data, error } = await supabase.from('achievements').select('badge_id').eq('user_id', userId)

  if (error) {
    throw fromSupabaseError(error, '実績の取得に失敗しました')
  }

  return (data ?? []).map((row) => row.badge_id).filter(isBadgeId)
}

export async function unlockAchievement(userId: string, badgeId: BadgeId): Promise<boolean> {
  const { error } = await supabase.from('achievements').insert({ user_id: userId, badge_id: badgeId })

  if (!error) {
    return true
  }

  if (error.code === '23505') {
    return false
  }

  throw fromSupabaseError(error, 'バッジの付与に失敗しました')
}

export async function checkAndUnlockAchievements(userId: string): Promise<BadgeId[]> {
  const newlyUnlocked: BadgeId[] = []
  const [unlockedBadgeIds, progresses, stats, dailyStreak, doctorStats, miniProjectCount, readingCorrectCount] =
    await Promise.all([
      getUnlockedAchievements(userId),
      getAllStepProgress(userId),
      getLearningStats(userId),
      getDailyStreakCount(userId),
      getCodeDoctorStats(userId),
      getMiniProjectCompletedCount(userId),
      getCodeReadingCorrectCount(userId),
    ])
  const unlockedSet = new Set<BadgeId>(unlockedBadgeIds)
  const completedStepIds = new Set(progresses.filter(isStepCompleted).map((progress) => progress.step_id))

  const tryUnlock = async (badgeId: BadgeId) => {
    if (unlockedSet.has(badgeId)) {
      return
    }

    const unlockedNow = await unlockAchievement(userId, badgeId)
    if (!unlockedNow) {
      return
    }

    unlockedSet.add(badgeId)
    newlyUnlocked.push(badgeId)
  }

  if (completedStepIds.size >= 1) {
    await tryUnlock('first-step')
  }

  if (progresses.some((progress) => progress.challenge_done)) {
    await tryUnlock('first-challenge')
  }

  if (stats.current_streak >= STREAK_THRESHOLD_BRONZE) {
    await tryUnlock('streak-3')
  }
  if (stats.current_streak >= STREAK_THRESHOLD_SILVER) {
    await tryUnlock('streak-7')
  }
  if (stats.current_streak >= STREAK_THRESHOLD_GOLD) {
    await tryUnlock('streak-30')
  }

  for (const rule of COURSE_COMPLETION_RULES) {
    if (rule.stepIds.length === 0) {
      continue
    }

    if (rule.stepIds.every((stepId) => completedStepIds.has(stepId))) {
      await tryUnlock(rule.badgeId)
    }
  }

  if (ALL_STEP_IDS.length > 0 && ALL_STEP_IDS.every((stepId) => completedStepIds.has(stepId))) {
    await tryUnlock('all-complete')
  }

  if (stats.total_points >= BADGE_POINT_THRESHOLD_MID) {
    await tryUnlock('pt-500')
  }
  if (stats.total_points >= BADGE_POINT_THRESHOLD_HIGH) {
    await tryUnlock('pt-1000')
  }

  // デイリーチャレンジ連続バッジ
  if (dailyStreak >= 7) await tryUnlock('daily-7')
  if (dailyStreak >= 30) await tryUnlock('daily-30')

  // コードドクターバッジ
  if (doctorStats.totalCompleted >= 10) await tryUnlock('doctor-10')
  if (doctorStats.advancedCompleted >= ADVANCED_DOCTOR_COUNT) await tryUnlock('doctor-all-advanced')

  // ミニプロジェクトバッジ
  if (miniProjectCount >= 1) await tryUnlock('first-mini-project')
  if (miniProjectCount >= 5) await tryUnlock('mini-project-5')

  // コードリーディングバッジ
  if (readingCorrectCount >= 10) await tryUnlock('reader-10')

  return newlyUnlocked
}
