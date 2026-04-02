import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLearningContext } from '../contexts/LearningContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getTodayChallenge, submitDailyAnswer, getWeeklyStatus, getTodayJst } from '../services/dailyChallengeService'
import { PracticeModeNav } from '../features/daily/components/PracticeModeNav'
import { WeeklyStatus } from '../features/daily/components/WeeklyStatus'
import { DailyChallengeCard } from '../features/daily/components/DailyChallengeCard'
import { CompletedView } from '../features/daily/components/CompletedView'
import { PracticePageLayout } from '../components/PracticePageLayout'
import { Spinner } from '../components/Spinner'
import type { TodayChallengeResult, SubmitResult, WeeklyStatusEntry } from '../content/daily/types'

export function DailyChallengePage() {
  useDocumentTitle('デイリーチャレンジ')

  const { user } = useAuth()
  const { completedStepIds, isLoadingStats } = useLearningContext()

  const [challenge, setChallenge] = useState<TodayChallengeResult | null>(null)
  const [weeklyStatus, setWeeklyStatus] = useState<WeeklyStatusEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const todayStr = getTodayJst()

  const loadChallenge = useCallback(async () => {
    if (!user || isLoadingStats) return
    setIsLoading(true)
    setError(null)
    try {
      const [challengeData, weekly] = await Promise.all([
        getTodayChallenge(user.id, completedStepIds),
        getWeeklyStatus(user.id),
      ])
      setChallenge(challengeData)
      setWeeklyStatus(weekly)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [user, completedStepIds, isLoadingStats])

  useEffect(() => {
    void loadChallenge()
  }, [loadChallenge])

  const handleSubmit = async (answer: string): Promise<SubmitResult> => {
    if (!user || !challenge?.question) {
      throw new Error('問題が読み込まれていません')
    }
    const result = await submitDailyAnswer(user.id, challenge.question, answer, challenge.dateStr)
    // 回答後に状態を更新
    setChallenge((prev) =>
      prev
        ? {
            ...prev,
            alreadyCompleted: true,
            completedAt: new Date().toISOString(),
            pointsEarned: result.pointsEarned,
            question: null,
          }
        : prev,
    )
    setWeeklyStatus((prev) =>
      prev.map((e) => (e.date === todayStr ? { ...e, completed: result.isCorrect } : e)),
    )
    return result
  }

  return (
    <PracticePageLayout>
      <div className="flex gap-6">
        <PracticeModeNav />

        <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-text-dark">デイリーチャレンジ</h1>
              <p className="mt-1 text-sm text-text-muted">完了済みステップから毎日1問出題されます</p>
            </div>

            {isLoading || isLoadingStats ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                {error}
              </div>
            ) : completedStepIds.size === 0 ? (
              <div className="rounded-xl border border-border bg-bg-surface p-8 text-center">
                <p className="text-2xl">📚</p>
                <p className="mt-2 font-semibold text-text-dark">ステップを完了するとチャレンジ解禁！</p>
                <p className="mt-1 text-sm text-text-muted">
                  まずはステップの学習を進めてください。完了済みステップの問題が毎日出題されます。
                </p>
              </div>
            ) : challenge?.alreadyCompleted ? (
              <CompletedView
                completedAt={challenge.completedAt}
                pointsEarned={challenge.pointsEarned}
                dateStr={challenge.dateStr}
              />
            ) : challenge?.question ? (
              <DailyChallengeCard
                question={challenge.question}
                dateStr={challenge.dateStr}
                onSubmit={handleSubmit}
              />
            ) : null}

            {weeklyStatus.length > 0 && (
              <WeeklyStatus entries={weeklyStatus} todayStr={todayStr} />
            )}
          </div>
        </div>
      </div>
    </PracticePageLayout>
  )
}
