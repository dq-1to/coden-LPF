import { supabase } from '../lib/supabaseClient'
import { MAX_CODE_LENGTH, POINTS_MINI_PROJECT_COMPLETE } from '../shared/constants'
import { fromSupabaseError } from '../shared/errors'
import { assertMaxLength, assertUuid } from '../shared/validation'
import { awardPoints } from './pointService'
import type {
  MiniProject,
  MiniProjectProgress,
  MiniProjectStatus,
  MilestoneJudgeResult,
  SubmitProjectResult,
} from '../content/mini-projects/types'

// ─── 純粋関数 ────────────────────────────────────────────

/**
 * コードの各マイルストーンを判定する（純粋関数）
 * 各マイルストーンの requiredKeywords がすべて含まれれば passed
 * 大文字小文字は無視する
 */
export function judgeProject(
  code: string,
  project: Pick<MiniProject, 'milestones'>,
): MilestoneJudgeResult[] {
  const lower = code.toLowerCase()
  return project.milestones.map((milestone) => ({
    milestoneId: milestone.id,
    passed: milestone.requiredKeywords.every((kw) => lower.includes(kw.toLowerCase())),
  }))
}

/**
 * マイルストーン判定結果からプロジェクトステータスを計算する（純粋関数）
 * 全通過 → completed / 1つ以上通過 → in_progress / 0通過 → not_started
 */
export function calcStatus(results: MilestoneJudgeResult[]): MiniProjectStatus {
  const passedCount = results.filter((r) => r.passed).length
  if (passedCount === results.length) return 'completed'
  if (passedCount > 0) return 'in_progress'
  return 'not_started'
}

// ─── DB 関数 ─────────────────────────────────────────────

/** ユーザーの全プロジェクト進捗を Map<projectId, MiniProjectProgress> で返す */
export async function getProjectProgressMap(
  userId: string,
): Promise<Map<string, MiniProjectProgress>> {
  assertUuid(userId, 'userId')
  const { data, error } = await supabase
    .from('mini_project_progress')
    .select('project_id, status, code, completed_at')
    .eq('user_id', userId)

  if (error) {
    throw fromSupabaseError(error, 'ミニプロジェクト進捗の取得に失敗しました')
  }

  const map = new Map<string, MiniProjectProgress>()
  for (const row of data ?? []) {
    map.set(row.project_id, {
      projectId: row.project_id,
      status: row.status as MiniProjectStatus,
      code: row.code,
      completedAt: row.completed_at,
    })
  }
  return map
}

/** コードを送信して判定・DB保存・Pt付与を行う */
export async function submitProject(
  userId: string,
  project: MiniProject,
  code: string,
  previousStatus: MiniProjectStatus,
): Promise<SubmitProjectResult> {
  assertUuid(userId, 'userId')
  assertMaxLength(code, MAX_CODE_LENGTH, 'code')
  const milestoneResults = judgeProject(code, project)
  const allPassed = milestoneResults.every((r) => r.passed)
  const newStatus = calcStatus(milestoneResults)

  const { error } = await supabase.from('mini_project_progress').upsert(
    {
      user_id: userId,
      project_id: project.id,
      status: newStatus,
      code,
    },
    { onConflict: 'user_id,project_id', ignoreDuplicates: false },
  )

  if (error) {
    throw fromSupabaseError(error, 'ミニプロジェクト送信に失敗しました')
  }

  const isNewlyCompleted = allPassed && previousStatus !== 'completed'
  const pointsEarned = isNewlyCompleted ? POINTS_MINI_PROJECT_COMPLETE : 0

  if (isNewlyCompleted) {
    await awardPoints(POINTS_MINI_PROJECT_COMPLETE, `ミニプロジェクト完了（${project.title}）`)
  }

  return { milestoneResults, allPassed, pointsEarned, newStatus }
}
