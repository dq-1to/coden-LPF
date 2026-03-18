import { useCallback, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { BookOpen, Check, Code2, PenLine, Trophy } from 'lucide-react'
import { ErrorBanner } from '../components/ErrorBanner'
import { LearningSidebar } from '../components/LearningSidebar'
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
    accentLabel: string
    icon: typeof BookOpen
    cardClassName: string
    iconClassName: string
    activeClassName: string
    doneClassName: string
  }
> = {
  read: {
    label: 'Read',
    description: '読んで理解しよう',
    accentLabel: 'Mint',
    icon: BookOpen,
    cardClassName: 'border-primary-mint/30 bg-gradient-to-r from-primary-mint/18 via-white to-primary-mint/5',
    iconClassName: 'bg-primary-mint text-primary-dark',
    activeClassName: 'border-primary-mint bg-primary-mint text-white shadow-sm shadow-primary-mint/30',
    doneClassName: 'border-primary-mint/30 bg-primary-mint/15 text-primary-dark',
  },
  practice: {
    label: 'Practice',
    description: '手を動かして定着させよう',
    accentLabel: 'Amber',
    icon: PenLine,
    cardClassName: 'border-amber-200 bg-gradient-to-r from-amber-100 via-white to-amber-50',
    iconClassName: 'bg-amber-100 text-amber-700',
    activeClassName: 'border-amber-400 bg-amber-400 text-slate-950 shadow-sm shadow-amber-300/40',
    doneClassName: 'border-amber-200 bg-amber-100 text-amber-800',
  },
  test: {
    label: 'Test',
    description: 'コードを書いて理解を確かめよう',
    accentLabel: 'Sky',
    icon: Code2,
    cardClassName: 'border-sky-200 bg-gradient-to-r from-sky-100 via-white to-sky-50',
    iconClassName: 'bg-sky-100 text-sky-700',
    activeClassName: 'border-sky-500 bg-sky-500 text-white shadow-sm shadow-sky-400/30',
    doneClassName: 'border-sky-200 bg-sky-100 text-sky-800',
  },
  challenge: {
    label: 'Challenge',
    description: '自由に実装して力を試そう',
    accentLabel: 'Violet',
    icon: Trophy,
    cardClassName: 'border-violet-200 bg-gradient-to-r from-violet-100 via-white to-violet-50',
    iconClassName: 'bg-violet-100 text-violet-700',
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
  const activeModeMeta = MODE_META[activeMode]
  const ActiveModeIcon = activeModeMeta.icon

  useDocumentTitle(step?.title ?? 'ステップ')

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

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-mint">Learning Step</p>
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
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition sm:px-4 sm:py-2 sm:text-sm ${
                          isActive
                            ? mode.activeClassName
                            : isDone
                              ? mode.doneClassName
                              : 'border-slate-200 bg-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-700'
                        }`}
                        type="button"
                        aria-label={mode.label}
                        aria-current={isActive ? 'step' : undefined}
                        onClick={() => setActiveMode(mode.id)}
                      >
                        <span
                          className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-black sm:h-6 sm:w-6 sm:text-xs ${
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

            <section
              key={activeMode}
              className={`mt-4 rounded-2xl border px-4 py-4 animate-fadeIn sm:px-5 ${activeModeMeta.cardClassName}`}
              aria-label={`${activeModeMeta.label} の説明`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${activeModeMeta.iconClassName}`}
                >
                  <ActiveModeIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Current Mode</p>
                    <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      {activeModeMeta.accentLabel}
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">{activeModeMeta.label}</h2>
                  <p className="mt-1 text-sm text-slate-700">{activeModeMeta.description}</p>
                </div>
              </div>
            </section>

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
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-800">
                  {nextStep
                    ? `チャレンジ完了です。次は「${nextStep.title}」へ進めます。`
                    : 'チャレンジ完了です。現在の学習フローはすべて完了しています。'}
                </p>
                <button
                  className="mt-3 rounded-lg bg-primary-mint px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-dark"
                  type="button"
                  aria-label={nextStep ? `次のステップ「${nextStep.title}」へ進む` : 'ダッシュボードへ戻る'}
                  onClick={handleNextStep}
                >
                  {nextStep ? '次のステップへ進む' : 'ダッシュボードへ戻る'}
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <div className="flex gap-4 text-sm">
          <Link className="font-medium text-primary-dark underline" to="/">
            ダッシュボードへ戻る
          </Link>
        </div>

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
