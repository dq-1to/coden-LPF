import { supabase } from '../lib/supabaseClient'
import { MAX_ANSWER_LENGTH, POINTS_DAILY_CORRECT, POINTS_DAILY_STREAK_BONUS } from '../shared/constants'
import { fromSupabaseError } from '../shared/errors'
import { assertMaxLength, assertUuid } from '../shared/validation'
import { awardPoints } from './pointService'
import { trackLearningEvent } from './eventService'
import {
  pickForDaily,
  recordWrongAnswer,
  resolveReviewItem,
  type DailyReviewCandidate,
  type ReviewMode,
} from './reviewService'
import { DAILY_QUESTIONS } from '../content/daily/questions'
import type {
  DailyReviewTarget,
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

const REVIEW_MODE_LABELS: Record<ReviewMode, string> = {
  practice: 'Practice',
  test: 'Test',
  challenge: 'Challenge',
  daily: 'Daily',
}

function selectByDate(pool: DailyQuestion[], dateStr: string): DailyQuestion | undefined {
  if (pool.length === 0) return undefined

  const epochDays = Math.floor(new Date(dateStr + 'T00:00:00Z').getTime() / (1000 * 60 * 60 * 24))
  return pool[epochDays % pool.length]
}

function getReviewReason(
  reviewCandidate: DailyReviewCandidate | null | undefined,
  question: DailyQuestion | undefined,
): string | null {
  if (!reviewCandidate || !question || reviewCandidate.step_id !== question.stepId) {
    return null
  }

  return `${REVIEW_MODE_LABELS[reviewCandidate.mode]}で復習待ちになったStepから出題しています。`
}

function getReviewTarget(
  reviewCandidate: DailyReviewCandidate | null | undefined,
  question: DailyQuestion | undefined,
): DailyReviewTarget | null {
  if (!reviewCandidate || !question || reviewCandidate.step_id !== question.stepId) {
    return null
  }

  return {
    stepId: reviewCandidate.step_id,
    mode: reviewCandidate.mode,
    questionId: reviewCandidate.question_id,
  }
}

/** 完了済みステップのプールから日付に基づいて問題を選択する（復習候補があれば優先） */
export function selectDailyQuestion(
  completedStepIds: ReadonlySet<string>,
  dateStr: string,
  reviewCandidate?: DailyReviewCandidate | null,
): DailyQuestion | undefined {
  if (completedStepIds.size === 0) return undefined

  // 完了済みステップの問題プールを生成
  const pool = DAILY_QUESTIONS.filter((q) => completedStepIds.has(q.stepId))
  if (pool.length === 0) return undefined

  if (reviewCandidate && completedStepIds.has(reviewCandidate.step_id)) {
    const exactQuestion = reviewCandidate.question_id
      ? pool.find((q) => q.id === reviewCandidate.question_id)
      : undefined

    if (exactQuestion) {
      return exactQuestion
    }

    const stepPool = pool.filter((q) => q.stepId === reviewCandidate.step_id)
    const stepQuestion = selectByDate(stepPool, dateStr)
    if (stepQuestion) {
      return stepQuestion
    }
  }

  return selectByDate(pool, dateStr)
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
      reviewReason: null,
      reviewTarget: null,
    }
  }

  let reviewCandidate: DailyReviewCandidate | null = null
  try {
    reviewCandidate = await pickForDaily(userId, completedStepIds)
  } catch {
    reviewCandidate = null
  }

  const question = selectDailyQuestion(completedStepIds, dateStr, reviewCandidate)

  return {
    question: question ?? null,
    alreadyCompleted: false,
    completedAt: null,
    pointsEarned: 0,
    dateStr,
    reviewReason: getReviewReason(reviewCandidate, question),
    reviewTarget: getReviewTarget(reviewCandidate, question),
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
  reviewTarget?: DailyReviewTarget | null,
): Promise<SubmitResult> {
  assertUuid(userId, 'userId')
  assertMaxLength(userAnswer, MAX_ANSWER_LENGTH, 'userAnswer')

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
        challenge_date: dateStr,
      },
      { onConflict: 'user_id,challenge_date' },
    )

  if (error) {
    throw fromSupabaseError(error, 'デイリーチャレンジの送信に失敗しました')
  }

  if (isCorrect) {
    try {
      await resolveReviewItem({
        userId,
        stepId: question.stepId,
        mode: 'daily',
        questionId: question.id,
      })
      if (
        reviewTarget &&
        (reviewTarget.stepId !== question.stepId ||
          reviewTarget.mode !== 'daily' ||
          reviewTarget.questionId !== question.id)
      ) {
        await resolveReviewItem({
          userId,
          stepId: reviewTarget.stepId,
          mode: reviewTarget.mode,
          questionId: reviewTarget.questionId ?? null,
        })
      }
    } catch {
      // 復習キュー同期の失敗でDaily回答完了を止めない。
    }
    await awardPoints(POINTS_DAILY_CORRECT, 'デイリーチャレンジ正解')

    // 7日連続ボーナスチェック（7の倍数日ごとに付与）
    const streak = await getDailyConsecutiveStreak(userId, dateStr)
    if (streak > 0 && streak % 7 === 0) {
      await awardPoints(POINTS_DAILY_STREAK_BONUS, `デイリー${streak}日連続ボーナス`)
    }

    trackLearningEvent({
      userId,
      eventType: 'daily_completed',
      stepId: question.stepId,
      mode: 'daily',
      payload: {
        questionId: question.id,
        challengeDate: dateStr,
        pointsEarned,
        streak,
      },
    })
  } else {
    try {
      await recordWrongAnswer({
        userId,
        stepId: question.stepId,
        mode: 'daily',
        questionId: question.id,
        expected: question.answer,
        userInput: userAnswer,
      })
    } catch {
      // 復習キュー同期の失敗でDaily回答結果の表示を止めない。
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
