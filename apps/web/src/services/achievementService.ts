import { COURSES } from '../content/courseData'
import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import type { Tables } from '../shared/types/database.types'
import { getAllStepProgress } from './progressService'
import { getLearningStats } from './statsService'

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
  { id: 'all-complete', name: 'Coden完走者', description: '全20ステップを完了した' },
  { id: 'pt-500', name: '500Pt達成', description: '累計500Pt以上を獲得した' },
  { id: 'pt-1000', name: '1000Pt達成', description: '累計1000Pt以上を獲得した' },
] as const

export type BadgeId = (typeof BADGE_DEFINITIONS)[number]['id']

const BADGE_ID_SET = new Set<BadgeId>(BADGE_DEFINITIONS.map((badge) => badge.id))
// all-complete は全20ステップ完了が条件なので未実装ステップも含む
const ALL_STEP_IDS = COURSES.flatMap((course) => course.steps.map((step) => step.id))
const COURSE_COMPLETION_RULES: Array<{ badgeId: BadgeId; stepIds: string[] }> = [
  { badgeId: 'course-1-complete', stepIds: getCourseStepIds('course-1') },
  { badgeId: 'course-2-complete', stepIds: getCourseStepIds('course-2') },
  { badgeId: 'course-3-complete', stepIds: getCourseStepIds('course-3') },
  { badgeId: 'course-4-complete', stepIds: getCourseStepIds('course-4') },
]

function getCourseStepIds(courseId: string): string[] {
  // isImplemented: false のステップはバッジ判定対象外とし、未実装コースの誤解禁を防止する
  return (
    COURSES.find((course) => course.id === courseId)
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
  const [unlockedBadgeIds, progresses, stats] = await Promise.all([
    getUnlockedAchievements(userId),
    getAllStepProgress(userId),
    getLearningStats(userId),
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

  if (stats.current_streak >= 3) {
    await tryUnlock('streak-3')
  }
  if (stats.current_streak >= 7) {
    await tryUnlock('streak-7')
  }
  if (stats.current_streak >= 30) {
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

  if (stats.total_points >= 500) {
    await tryUnlock('pt-500')
  }
  if (stats.total_points >= 1000) {
    await tryUnlock('pt-1000')
  }

  return newlyUnlocked
}
