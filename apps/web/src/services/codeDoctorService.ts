import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import {
  POINTS_CODE_DOCTOR_BEGINNER,
  POINTS_CODE_DOCTOR_INTERMEDIATE,
  POINTS_CODE_DOCTOR_ADVANCED,
} from '../shared/constants'
import { awardPoints } from './pointService'
import type { CodeDoctorProblem, CodeDoctorProgress, SubmitDoctorResult } from '../content/code-doctor/types'

// ─── 純粋関数 ────────────────────────────────────────────

/** 難易度に応じた獲得ポイントを返す */
export function getPointsForDifficulty(difficulty: CodeDoctorProblem['difficulty']): number {
  switch (difficulty) {
    case 'beginner':
      return POINTS_CODE_DOCTOR_BEGINNER
    case 'intermediate':
      return POINTS_CODE_DOCTOR_INTERMEDIATE
    case 'advanced':
      return POINTS_CODE_DOCTOR_ADVANCED
  }
}

/**
 * コードが問題の合格条件を満たしているか判定する（純粋関数）
 * - requiredKeywords をすべて含む
 * - ngKeywords をどれも含まない
 */
export function judgeCode(
  code: string,
  problem: Pick<CodeDoctorProblem, 'requiredKeywords' | 'ngKeywords'>,
): { passed: boolean; missingKeywords: string[]; foundNgKeywords: string[] } {
  const lower = code.toLowerCase()
  const missingKeywords = problem.requiredKeywords.filter(
    (kw) => !lower.includes(kw.toLowerCase()),
  )
  const foundNgKeywords = problem.ngKeywords.filter((kw) => lower.includes(kw.toLowerCase()))
  const passed = missingKeywords.length === 0 && foundNgKeywords.length === 0
  return { passed, missingKeywords, foundNgKeywords }
}

// ─── DB 関数 ─────────────────────────────────────────────

/** ユーザーの全問題進捗を Map<problemId, CodeDoctorProgress> で返す */
export async function getProblemProgressMap(
  userId: string,
): Promise<Map<string, CodeDoctorProgress>> {
  const { data, error } = await supabase
    .from('code_doctor_progress')
    .select('problem_id, solved, attempts, solved_at')
    .eq('user_id', userId)

  if (error) {
    throw fromSupabaseError(error, 'コードドクター進捗の取得に失敗しました')
  }

  const map = new Map<string, CodeDoctorProgress>()
  for (const row of data ?? []) {
    map.set(row.problem_id, {
      problemId: row.problem_id,
      solved: row.solved,
      attempts: row.attempts,
      solvedAt: row.solved_at,
    })
  }
  return map
}

/** コードを送信して判定・DB保存・Pt付与を行う */
export async function submitDoctorSolution(
  userId: string,
  problem: CodeDoctorProblem,
  code: string,
): Promise<SubmitDoctorResult> {
  const { passed, missingKeywords, foundNgKeywords } = judgeCode(code, problem)
  const pointsEarned = passed ? getPointsForDifficulty(problem.difficulty) : 0

  const { error } = await supabase.from('code_doctor_progress').upsert(
    {
      user_id: userId,
      problem_id: problem.id,
      category: problem.category,
      difficulty: problem.difficulty,
      solved: passed,
      solved_at: passed ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,problem_id', ignoreDuplicates: false },
  )

  if (error) {
    throw fromSupabaseError(error, 'コードドクター送信に失敗しました')
  }

  if (passed) {
    await awardPoints(
      pointsEarned,
      `コードドクター正解（${problem.difficulty}）`,
    )
  }

  return { passed, pointsEarned, missingKeywords, foundNgKeywords, explanation: problem.explanation }
}
