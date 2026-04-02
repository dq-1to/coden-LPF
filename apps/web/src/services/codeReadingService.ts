import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import {
  POINTS_CODE_READING_BASIC,
  POINTS_CODE_READING_INTERMEDIATE,
  POINTS_CODE_READING_ADVANCED,
} from '../shared/constants'
import { awardPoints } from './pointService'
import type {
  CodeReadingProblem,
  CodeReadingProgress,
  CodeReadingDifficulty,
  CodeReadingQuestion,
  QuestionJudgeResult,
  SubmitReadingResult,
} from '../content/code-reading/types'

// ─── 純粋関数 ────────────────────────────────────────────

/** 難易度に応じた獲得ポイントを返す */
export function getPointsForDifficulty(difficulty: CodeReadingDifficulty): number {
  switch (difficulty) {
    case 'basic':
      return POINTS_CODE_READING_BASIC
    case 'intermediate':
      return POINTS_CODE_READING_INTERMEDIATE
    case 'advanced':
      return POINTS_CODE_READING_ADVANCED
  }
}

/** 選択した回答が正解かどうかを判定する（純粋関数） */
export function judgeAnswer(
  selectedIndex: number,
  question: Pick<CodeReadingQuestion, 'correctIndex'>,
): boolean {
  return selectedIndex === question.correctIndex
}

// ─── DB 関数 ─────────────────────────────────────────────

/** ユーザーの全問題進捗を Map<problemId, CodeReadingProgress> で返す */
export async function getReadingProgressMap(
  userId: string,
): Promise<Map<string, CodeReadingProgress>> {
  const { data, error } = await supabase
    .from('code_reading_progress')
    .select('problem_id, correct_count, total_count, completed, completed_at')
    .eq('user_id', userId)

  if (error) {
    throw fromSupabaseError(error, 'コードリーディング進捗の取得に失敗しました')
  }

  const map = new Map<string, CodeReadingProgress>()
  for (const row of data ?? []) {
    map.set(row.problem_id, {
      problemId: row.problem_id,
      correctCount: row.correct_count,
      totalCount: row.total_count,
      completed: row.completed,
      completedAt: row.completed_at,
    })
  }
  return map
}

/**
 * 回答を送信して判定・DB保存・Pt付与を行う
 * previousCompleted: 送信前の completed 状態（初回完了時のみ Pt 付与に使用）
 */
export async function submitReading(
  userId: string,
  problem: CodeReadingProblem,
  answers: number[],
  previousCompleted: boolean,
): Promise<SubmitReadingResult> {
  const questionResults: QuestionJudgeResult[] = problem.questions.map((q, i) => ({
    questionId: q.id,
    isCorrect: judgeAnswer(answers[i] ?? -1, q),
    selectedIndex: answers[i] ?? -1,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  }))

  const correctCount = questionResults.filter((r) => r.isCorrect).length
  const allCorrect = correctCount === problem.questions.length
  const completedAt = allCorrect ? new Date().toISOString() : null

  const { error } = await supabase.from('code_reading_progress').upsert(
    {
      user_id: userId,
      problem_id: problem.id,
      correct_count: correctCount,
      total_count: problem.questions.length,
      completed: allCorrect,
      completed_at: completedAt,
    },
    { onConflict: 'user_id,problem_id', ignoreDuplicates: false },
  )

  if (error) {
    throw fromSupabaseError(error, 'コードリーディング送信に失敗しました')
  }

  const isNewlyCompleted = allCorrect && !previousCompleted
  const pointsEarned = isNewlyCompleted ? getPointsForDifficulty(problem.difficulty) : 0

  if (isNewlyCompleted) {
    await awardPoints(pointsEarned, `コードリーディング完了（${problem.title}）`)
  }

  return { questionResults, allCorrect, correctCount, pointsEarned }
}
