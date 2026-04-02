import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import { assertUuid } from '../shared/validation'
import { POINTS_BASE_NOOK_CORRECT } from '../shared/constants'
import { awardPoints } from './pointService'
import type {
  BaseNookQuestion,
  TopicProgressSummary,
} from '../content/base-nook/types'

// ─── 純粋関数 ────────────────────────────────────────────

/**
 * 未正解の問題を優先して count 問をランダム選択する（純粋関数）
 *
 * 1. 未正解の問題から最大 count 問を選ぶ
 * 2. 不足分は正解済みから補充
 * 3. 結果をシャッフルして返す
 */
export function selectQuestions(
  solvedIds: ReadonlySet<string>,
  pool: readonly BaseNookQuestion[],
  count: number,
): BaseNookQuestion[] {
  const unsolved = pool.filter((q) => !solvedIds.has(q.id))
  const solved = pool.filter((q) => solvedIds.has(q.id))

  const picked: BaseNookQuestion[] = []

  // 未正解から優先選択
  const shuffledUnsolved = [...unsolved].sort(() => Math.random() - 0.5)
  picked.push(...shuffledUnsolved.slice(0, count))

  // 不足分を正解済みから補充
  if (picked.length < count) {
    const shuffledSolved = [...solved].sort(() => Math.random() - 0.5)
    picked.push(...shuffledSolved.slice(0, count - picked.length))
  }

  // 最終シャッフル
  return picked.sort(() => Math.random() - 0.5)
}

// ─── DB 関数 ─────────────────────────────────────────────

/** トピックの正解済み問題ID一覧を取得する */
export async function getTopicProgress(
  userId: string,
  topicId: string,
): Promise<Set<string>> {
  assertUuid(userId, 'userId')

  const { data, error } = await supabase
    .from('base_nook_progress')
    .select('question_id')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .eq('correct', true)

  if (error) {
    throw fromSupabaseError(error, 'トピック進捗の取得に失敗しました')
  }

  return new Set((data ?? []).map((r) => r.question_id))
}

/** 全トピックの進捗サマリー（正解数）を取得する */
export async function getAllProgress(
  userId: string,
): Promise<TopicProgressSummary[]> {
  assertUuid(userId, 'userId')

  const { data, error } = await supabase
    .from('base_nook_progress')
    .select('topic_id, question_id')
    .eq('user_id', userId)
    .eq('correct', true)

  if (error) {
    throw fromSupabaseError(error, '全トピック進捗の取得に失敗しました')
  }

  // topic_id ごとに正解数を集計
  const map = new Map<string, number>()
  for (const row of data ?? []) {
    map.set(row.topic_id, (map.get(row.topic_id) ?? 0) + 1)
  }

  return Array.from(map.entries()).map(([topicId, correctCount]) => ({
    topicId,
    correctCount,
  }))
}

/**
 * 回答を記録する（upsert）
 * - 初回正答時のみポイントを付与する
 * - 返り値: ポイントが付与されたか
 */
export async function submitAnswer(
  userId: string,
  topicId: string,
  questionId: string,
  isCorrect: boolean,
): Promise<{ pointsAwarded: boolean }> {
  assertUuid(userId, 'userId')

  // まず既存レコードを確認（初回正答判定用）
  const { data: existing } = await supabase
    .from('base_nook_progress')
    .select('correct')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .maybeSingle()

  const alreadyCorrect = existing?.correct === true

  // upsert で回答記録
  const { error } = await supabase.from('base_nook_progress').upsert(
    {
      user_id: userId,
      topic_id: topicId,
      question_id: questionId,
      correct: isCorrect,
      answered_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,question_id' },
  )

  if (error) {
    throw fromSupabaseError(error, '回答の記録に失敗しました')
  }

  // 初回正答の場合のみポイント付与
  if (isCorrect && !alreadyCorrect) {
    await awardPoints(POINTS_BASE_NOOK_CORRECT, 'base_nook')
    return { pointsAwarded: true }
  }

  return { pointsAwarded: false }
}
