import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  getReadingProgressMap,
  judgeAnswer,
  submitReading,
} from '../services/codeReadingService'
import { PracticeModeNav } from '../features/daily/components/PracticeModeNav'
import { ReadingCard } from '../features/code-reading/components/ReadingCard'
import { PracticePageLayout } from '../components/PracticePageLayout'
import { Spinner } from '../components/Spinner'
import { CODE_READING_PROBLEMS } from '../content/code-reading/problems'
import type {
  CodeReadingDifficulty,
  CodeReadingProblem,
  CodeReadingProgress,
  SubmitReadingResult,
} from '../content/code-reading/types'

type FilterValue = 'all' | CodeReadingDifficulty

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'basic', label: '基礎' },
  { value: 'intermediate', label: '応用' },
  { value: 'advanced', label: '実践' },
]

export function CodeReadingPage() {
  useDocumentTitle('コードリーディング')

  const { user } = useAuth()

  const [progressMap, setProgressMap] = useState<Map<string, CodeReadingProgress>>(new Map())
  const [filter, setFilter] = useState<FilterValue>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 設問画面用 state
  const [selectedProblem, setSelectedProblem] = useState<CodeReadingProblem | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [isFinished, setIsFinished] = useState(false)
  const [submitResult, setSubmitResult] = useState<SubmitReadingResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const loadProgress = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const map = await getReadingProgressMap(user.id)
      setProgressMap(map)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'データの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadProgress()
  }, [loadProgress])

  function handleSelectProblem(problem: CodeReadingProblem) {
    setSelectedProblem(problem)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setHasAnswered(false)
    setUserAnswers([])
    setIsFinished(false)
    setSubmitResult(null)
    setSubmitError(null)
  }

  function handleBack() {
    setSelectedProblem(null)
  }

  async function handleAnswer() {
    if (selectedAnswer === null || !selectedProblem || !user) return
    const newAnswers = [...userAnswers, selectedAnswer]
    setUserAnswers(newAnswers)
    setHasAnswered(true)

    const isLastQuestion = currentQuestionIndex === selectedProblem.questions.length - 1
    if (isLastQuestion) {
      setIsSubmitting(true)
      setSubmitError(null)
      try {
        const previousCompleted = progressMap.get(selectedProblem.id)?.completed ?? false
        const result = await submitReading(user.id, selectedProblem, newAnswers, previousCompleted)
        setSubmitResult(result)
        setIsFinished(true)
        setProgressMap((prev) => {
          const next = new Map(prev)
          next.set(selectedProblem.id, {
            problemId: selectedProblem.id,
            correctCount: result.correctCount,
            totalCount: selectedProblem.questions.length,
            completed: result.allCorrect,
            completedAt: result.allCorrect
              ? new Date().toISOString()
              : (prev.get(selectedProblem.id)?.completedAt ?? null),
          })
          return next
        })
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : '送信に失敗しました')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  function handleNextQuestion() {
    setCurrentQuestionIndex((i) => i + 1)
    setSelectedAnswer(null)
    setHasAnswered(false)
  }

  const filteredProblems =
    filter === 'all' ? CODE_READING_PROBLEMS : CODE_READING_PROBLEMS.filter((p) => p.difficulty === filter)

  // ─── 設問ビュー ─────────────────────────────────────────
  if (selectedProblem) {
    const currentQuestion = selectedProblem.questions[currentQuestionIndex]
    if (!currentQuestion) return null
    const isCurrentCorrect = hasAnswered && selectedAnswer !== null
      ? judgeAnswer(selectedAnswer, currentQuestion)
      : null

    return (
      <PracticePageLayout>
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <PracticeModeNav />

          <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-text-muted hover:text-text-dark"
              >
                ← 一覧に戻る
              </button>

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-dark">{selectedProblem.title}</h2>
                {!isFinished && (
                  <span className="text-sm text-text-muted">
                    設問 {currentQuestionIndex + 1} / {selectedProblem.questions.length}
                  </span>
                )}
              </div>

              {/* コードスニペット */}
              <div className="overflow-x-auto rounded-xl border border-border bg-slate-900">
                <pre className="p-4 text-sm leading-relaxed text-slate-100">
                  <code>{selectedProblem.codeSnippet}</code>
                </pre>
              </div>

              {/* 結果サマリー */}
              {isFinished && submitResult && (
                <div
                  className={`rounded-xl border p-5 ${submitResult.allCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}
                  role="status"
                >
                  {submitResult.allCorrect ? (
                    <>
                      <p className="font-semibold text-emerald-800">
                        ✅ 全問正解！
                        {submitResult.pointsEarned > 0 && ` +${submitResult.pointsEarned} Pt`}
                      </p>
                      <p className="mt-1 text-sm text-emerald-700">
                        {submitResult.pointsEarned > 0
                          ? 'おめでとうございます！初回完了ボーナスを獲得しました。'
                          : 'このコードはすでに完了済みです。'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-amber-800">
                        {submitResult.correctCount} / {submitResult.questionResults.length} 問正解
                      </p>
                      <p className="mt-1 text-sm text-amber-700">
                        全問正解するともう一度挑戦できます。コードをよく読んで再挑戦しましょう！
                      </p>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleBack}
                    className="mt-3 text-sm font-medium text-text-muted hover:text-text-dark"
                  >
                    一覧に戻る →
                  </button>
                </div>
              )}

              {/* 設問 */}
              {!isFinished && (
                <div className="space-y-3 rounded-xl border border-border bg-bg-surface p-5">
                  <p className="font-medium text-text-dark">{currentQuestion.text}</p>

                  <div className="space-y-2">
                    {currentQuestion.choices.map((choice, idx) => {
                      let choiceStyle = 'border-border text-text-dark hover:border-amber-400'
                      if (hasAnswered) {
                        if (idx === currentQuestion.correctIndex) {
                          choiceStyle = 'border-emerald-400 bg-emerald-50 text-emerald-800'
                        } else if (idx === selectedAnswer && !isCurrentCorrect) {
                          choiceStyle = 'border-rose-400 bg-rose-50 text-rose-800'
                        } else {
                          choiceStyle = 'border-border text-text-muted'
                        }
                      } else if (idx === selectedAnswer) {
                        choiceStyle = 'border-amber-400 bg-amber-50 text-amber-800'
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={hasAnswered}
                          onClick={() => setSelectedAnswer(idx)}
                          className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${choiceStyle}`}
                        >
                          {String.fromCharCode(65 + idx)}. {choice}
                        </button>
                      )
                    })}
                  </div>

                  {/* 即時フィードバック */}
                  {hasAnswered && (
                    <div
                      className={`rounded-lg border p-3 text-sm ${isCurrentCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}
                      role="status"
                    >
                      <p className="font-semibold">{isCurrentCorrect ? '✅ 正解！' : '❌ 不正解'}</p>
                      <p className="mt-1">{currentQuestion.explanation}</p>
                    </div>
                  )}

                  {submitError && (
                    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {submitError}
                    </p>
                  )}

                  {/* アクションボタン */}
                  <div className="flex gap-3 pt-1">
                    {!hasAnswered ? (
                      <button
                        type="button"
                        onClick={() => void handleAnswer()}
                        disabled={selectedAnswer === null || isSubmitting}
                        className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        回答する
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        disabled={isSubmitting}
                        className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
                      >
                        {isSubmitting ? '送信中...' : '次の設問へ →'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PracticePageLayout>
    )
  }

  // ─── 一覧ビュー ─────────────────────────────────────────
  return (
    <PracticePageLayout>
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <PracticeModeNav />

        <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-text-dark">コードリーディング</h1>
              <p className="mt-1 text-sm text-text-muted">
                コードを読んで設問に回答し、読解力を鍛えましょう
              </p>
            </div>

            {/* フィルター */}
            <div className="flex gap-2">
              {FILTER_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={[
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    filter === value
                      ? 'bg-amber-500 text-white'
                      : 'border border-border text-text-muted hover:border-amber-400 hover:text-amber-600',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : error ? (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProblems.map((problem) => (
                  <ReadingCard
                    key={problem.id}
                    problem={problem}
                    progress={progressMap.get(problem.id)}
                    onClick={() => handleSelectProblem(problem)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PracticePageLayout>
  )
}
