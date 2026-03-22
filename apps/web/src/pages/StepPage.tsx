import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { BookOpen, Check, Code2, PenLine, Trophy } from 'lucide-react'
import { ErrorBanner } from '../components/ErrorBanner'
import { LearningSidebar } from '../components/LearningSidebar'
import { TOTAL_STEP_COUNT } from '../content/courseData'
import { PageSpinner } from '../components/Spinner'
import type { LearningMode } from '../content/fundamentals/steps'
import { useAuth } from '../contexts/AuthContext'
import { useLearningContext } from '../contexts/LearningContext'
import { ChallengeMode } from '../features/learning/ChallengeMode'
import { ChallengeSubmissionHistory } from '../features/learning/ChallengeSubmissionHistory'
import { PracticeMode } from '../features/learning/PracticeMode'
import { ReadMode } from '../features/learning/ReadMode'
import { TestMode } from '../features/learning/TestMode'
import { AppHeader } from '../features/dashboard/components/AppHeader'
import { useChallengeSubmission } from '../features/learning/hooks/useChallengeSubmission'
import { useLearningStep } from '../features/learning/hooks/useLearningStep'
import { useRecentChallengeSubmissions } from '../features/learning/hooks/useRecentChallengeSubmissions'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getDisplayName } from '../shared/utils/getDisplayName'

const MODE_META: Record<
  LearningMode,
  {
    label: string
    description: string
    icon: typeof BookOpen
    activeClassName: string
    doneClassName: string
  }
> = {
  read: {
    label: 'Read',
    description: '読んで理解しよう',
    icon: BookOpen,
    activeClassName: 'border-primary-mint bg-primary-mint text-white shadow-sm shadow-primary-mint/30',
    doneClassName: 'border-primary-mint/30 bg-primary-mint/15 text-primary-dark',
  },
  practice: {
    label: 'Practice',
    description: '手を動かして定着させよう',
    icon: PenLine,
    activeClassName: 'border-amber-400 bg-amber-400 text-slate-950 shadow-sm shadow-amber-300/40',
    doneClassName: 'border-amber-200 bg-amber-100 text-amber-800',
  },
  test: {
    label: 'Test',
    description: 'コードを書いて理解を確かめよう',
    icon: Code2,
    activeClassName: 'border-sky-500 bg-sky-500 text-white shadow-sm shadow-sky-400/30',
    doneClassName: 'border-sky-200 bg-sky-100 text-sky-800',
  },
  challenge: {
    label: 'Challenge',
    description: '自由に実装して力を試そう',
    icon: Trophy,
    activeClassName: 'border-violet-500 bg-violet-500 text-white shadow-sm shadow-violet-400/30',
    doneClassName: 'border-violet-200 bg-violet-100 text-violet-800',
  },
}

export function StepPage() {
  const { stepId = '' } = useParams()
  const { signOut, user } = useAuth()
  const { completedStepsCount, isLoadingStats } = useLearningContext()
  const navigate = useNavigate()
  const [activeMode, setActiveMode] = useState<LearningMode>('read')
  const [pulseModes, setPulseModes] = useState<Record<LearningMode, boolean>>({
    read: false,
    practice: false,
    test: false,
    challenge: false,
  })
  const challengeCompleteRef = useRef<HTMLDivElement | null>(null)
  const previousModeStatusRef = useRef<Record<LearningMode, boolean> | null>(null)
  const pulseTimeoutsRef = useRef<number[]>([])
  const saveChallengeSubmission = useChallengeSubmission(stepId)
  const recentChallengeSubmissions = useRecentChallengeSubmissions(stepId)
  const handleChallengeSubmitResult = useCallback(
    async (result: { code: string; isPassed: boolean; matchedKeywords: string[] }) => {
      await saveChallengeSubmission(result)
      await recentChallengeSubmissions.refresh()
    },
    [recentChallengeSubmissions, saveChallengeSubmission],
  )

  const {
    step,
    isUnavailableStep,
    modeStatus,
    syncMessage,
    toastMessage,
    nextStep,
    sidebarTitle,
    sidebarSteps,
    handleModeComplete,
  } = useLearningStep(stepId)

  const headerDisplayName = useMemo(() => getDisplayName(user), [user])
  const modeButtons = useMemo(
    () =>
      (['read', 'practice', 'test', 'challenge'] as LearningMode[]).map((id) => ({
        id,
        ...MODE_META[id],
      })),
    [],
  )
  useDocumentTitle(step?.title ?? 'ステップ')

  useEffect(() => {
    if (!previousModeStatusRef.current) {
      previousModeStatusRef.current = modeStatus
      return
    }

    const previousModeStatus = previousModeStatusRef.current
    const newlyCompletedModes = (Object.keys(modeStatus) as LearningMode[]).filter(
      (mode) => !previousModeStatus[mode] && modeStatus[mode],
    )

    if (newlyCompletedModes.length > 0) {
      setPulseModes((current) => {
        const next = { ...current }

        for (const mode of newlyCompletedModes) {
          next[mode] = true
        }

        return next
      })

      for (const mode of newlyCompletedModes) {
        const timeoutId = window.setTimeout(() => {
          setPulseModes((current) => ({
            ...current,
            [mode]: false,
          }))
        }, 750)

        pulseTimeoutsRef.current.push(timeoutId)
      }
    }

    if (!previousModeStatus.challenge && modeStatus.challenge) {
      challengeCompleteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    previousModeStatusRef.current = modeStatus
  }, [modeStatus])

  useEffect(() => {
    const timeoutIds = pulseTimeoutsRef.current

    return () => {
      for (const timeoutId of timeoutIds) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  async function handleSignOut() {
    const errorMessage = await signOut()
    if (errorMessage) {
      return
    }

    navigate('/login', { replace: true })
  }

  function handleNextStep() {
    if (!nextStep) {
      navigate('/', { replace: false })
      return
    }

    navigate(`/step/${nextStep.id}`, { replace: true })
  }

  if (isUnavailableStep || (!isLoadingStats && step && step.order > completedStepsCount + 1)) {
    return <Navigate to="/" replace />
  }

  if (isLoadingStats) {
    return <PageSpinner />
  }

  if (!step) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
        <h1 className="text-3xl font-bold">指定したステップが見つかりません</h1>
        <Link className="text-sm font-medium text-primary-dark underline" to="/step/usestate-basic">
          最初のステップへ戻る
        </Link>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50">
      <AppHeader displayName={headerDisplayName} onSignOut={() => void handleSignOut()} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500" aria-label="パンくずリスト">
          <Link className="font-medium text-primary-dark underline" to="/">
            ダッシュボード
          </Link>
          <span aria-hidden="true">/</span>
          <span>{sidebarTitle}</span>
          <span aria-hidden="true">/</span>
          <span className="text-slate-700">{step.title}</span>
        </nav>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-mint/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary-dark">
              学習ステップ
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {sidebarTitle}
            </span>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              Step {step.order} / {TOTAL_STEP_COUNT}
            </span>
          </div>
          <h1 className="text-3xl font-bold">{step.title}</h1>
          <p className="text-slate-600">{step.summary}</p>
        </section>

        <section className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <LearningSidebar courseTitle={sidebarTitle} currentStepId={stepId} steps={sidebarSteps} />

          <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <nav className="mt-4 border-b border-slate-200 pb-4" aria-label="学習モードステッパー">
              <ol className="flex items-center gap-0">
                {modeButtons.map((mode, index) => {
                  const isActive = activeMode === mode.id
                  const isDone = modeStatus[mode.id]
                  const ModeIcon = mode.icon

                  return (
                    <li key={mode.id} className="flex items-center">
                      {index > 0 ? (
                        <div
                          className={`h-0 w-6 border-t-2 sm:w-10 ${
                            modeStatus[modeButtons[index - 1].id] ? 'border-primary-mint' : 'border-slate-200'
                          }`}
                        />
                      ) : null}
                      <button
                        className={`flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
                          isActive
                            ? mode.activeClassName
                            : isDone
                              ? mode.doneClassName
                              : 'border-slate-200 bg-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-700'
                        } ${pulseModes[mode.id] ? 'animate-pulseMint' : ''}`}
                        type="button"
                        title={mode.description}
                        aria-label={mode.label}
                        aria-current={isActive ? 'step' : undefined}
                        onClick={() => setActiveMode(mode.id)}
                      >
                        <span
                          className={`grid h-6 w-6 place-items-center rounded-full text-xs font-black sm:h-6 sm:w-6 ${
                            isActive
                              ? 'bg-white/20'
                              : isDone
                                ? 'bg-white/60 text-slate-800'
                                : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isDone ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : index + 1}
                        </span>
                        <ModeIcon className="hidden h-3.5 w-3.5 sm:block" aria-hidden="true" />
                        <span className="hidden sm:inline">{mode.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </nav>

            {syncMessage ? <ErrorBanner className="mt-4">{syncMessage}</ErrorBanner> : null}

            {activeMode === 'read' ? (
              <ReadMode
                markdown={step.readMarkdown}
                onComplete={() => void handleModeComplete('read')}
                isCompleted={modeStatus.read}
              />
            ) : null}

            {activeMode === 'practice' ? (
              <PracticeMode
                stepId={step.id}
                questions={step.practiceQuestions}
                onComplete={() => void handleModeComplete('practice')}
              />
            ) : null}

            {activeMode === 'test' ? (
              <TestMode stepId={step.id} task={step.testTask} onComplete={() => void handleModeComplete('test')} />
            ) : null}

            {activeMode === 'challenge' ? (
              <>
                <ChallengeMode
                  stepId={step.id}
                  task={step.challengeTask}
                  onComplete={() => void handleModeComplete('challenge')}
                  onSubmitResult={handleChallengeSubmitResult}
                />
                <ChallengeSubmissionHistory
                  submissions={recentChallengeSubmissions.submissions}
                  isLoading={recentChallengeSubmissions.isLoading}
                  error={recentChallengeSubmissions.error}
                />
              </>
            ) : null}

            {modeStatus.challenge ? (
              <div ref={challengeCompleteRef} className="mt-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-6">
                <p className="text-base font-semibold text-emerald-800">
                  {nextStep
                    ? `このステップを完了しました！ 次は「${nextStep.title}」へ進めます。`
                    : 'おめでとうございます！ 現在の学習フローをすべて完了しました。'}
                </p>
                <button
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-mint px-6 py-3 text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark active:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-primary-mint/30"
                  type="button"
                  aria-label={nextStep ? `次のステップ「${nextStep.title}」へ進む` : 'ダッシュボードへ戻る'}
                  onClick={handleNextStep}
                >
                  {nextStep ? '次のステップへ進む →' : 'ダッシュボードへ戻る →'}
                </button>
              </div>
            ) : null}
          </div>
        </section>
        {toastMessage ? (
          <div
            className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 shadow-xl"
            role="alert"
            aria-live="assertive"
          >
            <p className="font-semibold">学習を保存しました</p>
            <p className="mt-1">{toastMessage}</p>
          </div>
        ) : null}
      </main>
    </div>
  )
}
