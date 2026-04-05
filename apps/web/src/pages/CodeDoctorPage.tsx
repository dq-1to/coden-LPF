import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { CodeEditor } from '../components/CodeEditor'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getProblemProgressMap, submitDoctorSolution } from '../services/codeDoctorService'
import { PracticeModeNav } from '../features/daily/components/PracticeModeNav'
import { ProblemCard } from '../features/code-doctor/components/ProblemCard'
import { PracticePageLayout } from '../components/PracticePageLayout'
import { Spinner } from '../components/Spinner'
import { CODE_DOCTOR_PROBLEMS } from '../content/code-doctor/problems'
import type { CodeDoctorDifficulty, CodeDoctorProblem, CodeDoctorProgress, SubmitDoctorResult } from '../content/code-doctor/types'

type FilterValue = 'all' | CodeDoctorDifficulty

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: '全て' },
  { value: 'beginner', label: '初級' },
  { value: 'intermediate', label: '中級' },
  { value: 'advanced', label: '上級' },
]

const DIFFICULTY_STARS: Record<CodeDoctorDifficulty, string> = {
  beginner: '★☆☆',
  intermediate: '★★☆',
  advanced: '★★★',
}

export function CodeDoctorPage() {
  useDocumentTitle('コードドクター')

  const { user } = useAuth()

  const [progressMap, setProgressMap] = useState<Map<string, CodeDoctorProgress>>(new Map())
  const [filter, setFilter] = useState<FilterValue>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 問題ビュー用
  const [selectedProblem, setSelectedProblem] = useState<CodeDoctorProblem | null>(null)
  const [code, setCode] = useState('')
  const [result, setResult] = useState<SubmitDoctorResult | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const loadProgress = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const map = await getProblemProgressMap(user.id)
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

  function handleSelectProblem(problem: CodeDoctorProblem) {
    setSelectedProblem(problem)
    setCode(problem.buggyCode)
    setResult(null)
    setShowHint(false)
    setSubmitError(null)
  }

  function handleBack() {
    setSelectedProblem(null)
    setResult(null)
    setShowHint(false)
  }

  async function handleSubmit() {
    if (!user || !selectedProblem) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await submitDoctorSolution(user.id, selectedProblem, code)
      setResult(res)
      if (res.passed) {
        setProgressMap((prev) => {
          const next = new Map(prev)
          next.set(selectedProblem.id, {
            problemId: selectedProblem.id,
            solved: true,
            attempts: (prev.get(selectedProblem.id)?.attempts ?? 0) + 1,
            solvedAt: new Date().toISOString(),
          })
          return next
        })
      }
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '送信に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredProblems =
    filter === 'all'
      ? CODE_DOCTOR_PROBLEMS
      : CODE_DOCTOR_PROBLEMS.filter((p) => p.difficulty === filter)

  // ─── 問題ビュー ─────────────────────────────────────────
  if (selectedProblem) {
    return (
      <PracticePageLayout>
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <PracticeModeNav />

          <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row">
            {/* 問題パネル */}
            <div className="w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:w-72 lg:shrink-0">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-text-muted hover:text-text-dark"
              >
                ← 一覧に戻る
              </button>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  難易度: {DIFFICULTY_STARS[selectedProblem.difficulty]}
                </p>
                <h2 className="mt-1 text-lg font-bold text-text-dark">{selectedProblem.title}</h2>
              </div>

              <div className="rounded-xl border border-border bg-bg-surface p-4 text-sm text-text-dark">
                <p className="font-semibold text-text-muted">期待される動作:</p>
                <p className="mt-1">{selectedProblem.description}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className="text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                💡 {showHint ? 'ヒントを隠す' : 'ヒントを表示'}
              </button>

              {showHint && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  {selectedProblem.hint}
                </div>
              )}

              {result && (
                <div
                  className={`rounded-xl border p-4 text-sm ${result.passed ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}
                  role="status"
                >
                  {result.passed ? (
                    <>
                      <p className="font-semibold text-emerald-800">
                        ✅ 正解！ +{result.pointsEarned} Pt
                      </p>
                      <p className="mt-2 text-emerald-700">{result.explanation}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-rose-800">❌ まだバグが残っています</p>
                      {result.missingKeywords.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-rose-700">不足している修正:</p>
                          <ul className="mt-1 list-inside list-disc text-xs text-rose-700">
                            {result.missingKeywords.map((kw) => (
                              <li key={kw}>{kw}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.foundNgKeywords.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-rose-700">残っているバグ:</p>
                          <ul className="mt-1 list-inside list-disc text-xs text-rose-700">
                            {result.foundNgKeywords.map((kw) => (
                              <li key={kw}>{kw}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {submitError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {submitError}
                </p>
              )}
            </div>

            {/* Monaco エディタ */}
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="overflow-hidden rounded-xl border border-border">
                <CodeEditor
                  value={code}
                  onChange={(v) => { setCode(v); setResult(null) }}
                  language="typescript"
                  height="480px"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting || result?.passed === true}
                  className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? '判定中...' : '判定する'}
                </button>
                {result?.passed && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm font-medium text-text-muted hover:text-text-dark"
                  >
                    一覧に戻る →
                  </button>
                )}
              </div>
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
              <h1 className="text-2xl font-bold text-text-dark">コードドクター</h1>
              <p className="mt-1 text-sm text-text-muted">
                バグ入りコードを修正してデバッグスキルを鍛えましょう
              </p>
            </div>

            {/* フィルタ */}
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
                  <ProblemCard
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
