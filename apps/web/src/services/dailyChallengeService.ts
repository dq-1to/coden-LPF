import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import { POINTS_DAILY_CORRECT, POINTS_DAILY_STREAK_BONUS } from '../shared/constants'
import { awardPoints } from './pointService'
import { DAILY_QUESTIONS } from '../content/daily/questions'
import type {
  DailyQuestion,
  TodayChallengeResult,
  SubmitResult,
  WeeklyStatusEntry,
} from '../content/daily/types'

// ─── 純粋関数 ────────────────────────────────────────────

/** 現在の JST 日付を 'YYYY-MM-DD' 形式で返す */
export function getTodayJst(now?: Date): string {
  const d = now ?? new Date()
  // UTC+9 に補正
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000)
  return jst.toISOString().slice(0, 10)
}

/** dateStr ('YYYY-MM-DD') が含まれる週（月〜日）の7日分の日付を返す */
export function getCurrentWeekDates(now?: Date): string[] {
  const todayStr = getTodayJst(now)
  const today = new Date(todayStr + 'T00:00:00Z')
  // 0=日, 1=月, ..., 6=土 → 月曜を週の起点にする
  const dayOfWeek = today.getUTCDay() // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today.getTime() + mondayOffset * 24 * 60 * 60 * 1000)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getTime() + i * 24 * 60 * 60 * 1000)
    return d.toISOString().slice(0, 10)
  })
}

/** 完了済みステップのプールから日付に基づいて問題を選択する（決定論的） */
export function selectDailyQuestion(
  completedStepIds: ReadonlySet<string>,
  dateStr: string,
): DailyQuestion | undefined {
  if (completedStepIds.size === 0) return undefined

  // 完了済みステップの問題プールを生成
  const pool = DAILY_QUESTIONS.filter((q) => completedStepIds.has(q.stepId))
  if (pool.length === 0) return undefined

  // epochDays を決定論的シードとして使用
  const epochDays = Math.floor(new Date(dateStr + 'T00:00:00Z').getTime() / (1000 * 60 * 60 * 24))
  return pool[epochDays % pool.length]
}

// ─── DB 関数 ─────────────────────────────────────────────

/** 今日のチャレンジ情報を取得する */
export async function getTodayChallenge(
  userId: string,
  completedStepIds: ReadonlySet<string>,
  now?: Date,
): Promise<TodayChallengeResult> {
  const dateStr = getTodayJst(now)

  // 今日の完了履歴を確認
  const { data: history, error } = await supabase
    .from('daily_challenge_history')
    .select('challenge_id, completed, points_earned, completed_at')
    .eq('user_id', userId)
    .eq('challenge_date', dateStr)
    .maybeSingle()

  if (error) {
    throw fromSupabaseError(error, 'デイリーチャレンジ履歴の取得に失敗しました')
  }

  if (history?.completed) {
    return {
      question: null,
      alreadyCompleted: true,
      completedAt: history.completed_at,
      pointsEarned: history.points_earned,
      dateStr,
    }
  }

  const question = selectDailyQuestion(completedStepIds, dateStr)

  return {
    question: question ?? null,
    alreadyCompleted: false,
    completedAt: null,
    pointsEarned: 0,
    dateStr,
  }
}

/** 指定日時点でのデイリーチャレンジ連続完了日数を返す（today を起点に遡る） */
async function getDailyConsecutiveStreak(userId: string, today: string): Promise<number> {
  const { data, error } = await supabase
    .from('daily_challenge_history')
    .select('challenge_date, completed')
    .eq('user_id', userId)

  if (error) throw fromSupabaseError(error, 'デイリー連続記録の取得に失敗しました')

  const completedDates = new Set(
    (data ?? []).filter((r) => r.completed).map((r) => r.challenge_date as string),
  )

  let streak = 0
  let d = new Date(today + 'T00:00:00Z')

  while (completedDates.has(d.toISOString().slice(0, 10))) {
    streak++
    d = new Date(d.getTime() - 24 * 60 * 60 * 1000)
  }

  return streak
}

/** デイリーチャレンジの回答を送信する */
export async function submitDailyAnswer(
  userId: string,
  question: DailyQuestion,
  userAnswer: string,
  dateStr: string,
): Promise<SubmitResult> {
  const isCorrect = userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()
  const pointsEarned = isCorrect ? POINTS_DAILY_CORRECT : 0

  const { error } = await supabase
    .from('daily_challenge_history')
    .upsert(
      {
        user_id: userId,
        challenge_id: question.id,
        completed: true,
        points_earned: pointsEarned,
        completed_at: new Date().toISOString(),
        challenge_date: dateStr,
      },
      { onConflict: 'user_id,challenge_date' },
    )

  if (error) {
    throw fromSupabaseError(error, 'デイリーチャレンジの送信に失敗しました')
  }

  if (isCorrect) {
    await awardPoints(userId, POINTS_DAILY_CORRECT, 'デイリーチャレンジ正解')

    // 7日連続ボーナスチェック（7の倍数日ごとに付与）
    const streak = await getDailyConsecutiveStreak(userId, dateStr)
    if (streak > 0 && streak % 7 === 0) {
      await awardPoints(userId, POINTS_DAILY_STREAK_BONUS, `デイリー${streak}日連続ボーナス`)
    }
  }

  return {
    isCorrect,
    pointsEarned,
    correctAnswer: question.answer,
    explanation: question.explanation,
  }
}

/** 今週（月〜日）の達成状況を取得する */
export async function getWeeklyStatus(
  userId: string,
  now?: Date,
): Promise<WeeklyStatusEntry[]> {
  const weekDates = getCurrentWeekDates(now)
  const [from, to] = [weekDates[0], weekDates[6]]

  const { data, error } = await supabase
    .from('daily_challenge_history')
    .select('challenge_date, completed')
    .eq('user_id', userId)
    .gte('challenge_date', from)
    .lte('challenge_date', to)

  if (error) {
    throw fromSupabaseError(error, '週間達成状況の取得に失敗しました')
  }

  const completedDates = new Set(
    (data ?? []).filter((r) => r.completed).map((r) => r.challenge_date),
  )

  return weekDates.map((date) => ({
    date,
    completed: completedDates.has(date),
  }))
}
