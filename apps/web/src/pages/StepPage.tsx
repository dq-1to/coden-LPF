import { useCallback, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { LearningSidebar } from '../components/LearningSidebar'
import { useAuth } from '../contexts/AuthContext'
import { useLearningContext } from '../contexts/LearningContext'
import { AppHeader } from '../features/dashboard/components/AppHeader'
import { ChallengeMode } from '../features/learning/ChallengeMode'
import { ChallengeSubmissionHistory } from '../features/learning/ChallengeSubmissionHistory'
import { PracticeMode } from '../features/learning/PracticeMode'
import { ReadMode } from '../features/learning/ReadMode'
import { TestMode } from '../features/learning/TestMode'
import { useChallengeSubmission } from '../features/learning/hooks/useChallengeSubmission'
import { useRecentChallengeSubmissions } from '../features/learning/hooks/useRecentChallengeSubmissions'
import { useLearningStep } from '../features/learning/hooks/useLearningStep'
import type { LearningMode } from '../content/fundamentals/steps'
import { getDisplayName } from '../shared/utils/getDisplayName'

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

  const modeButtons: { id: LearningMode; label: string }[] = useMemo(
    () => [
      { id: 'read', label: 'Read' },
      { id: 'practice', label: 'Practice' },
      { id: 'test', label: 'Test' },
      { id: 'challenge', label: 'Challenge' },
    ],
    [],
  )

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-medium text-slate-500">読み込み中...</p>
      </div>
    )
  }

  if (!step) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
        <h1 className="text-3xl font-bold">指定したステップが見つかりません</h1>
        <p className="text-slate-600">stepId: {stepId}</p>
        <Link className="text-sm font-medium text-blue-700 underline" to="/step/usestate-basic">
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
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">stepId: {step.id}</p>

            <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
              {modeButtons.map((mode) => {
                const isActive = activeMode === mode.id
                return (
                  <button
                    key={mode.id}
                    className={`rounded-md px-4 py-2 text-sm font-bold transition ${isActive ? 'bg-primary-mint text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveMode(mode.id)}
                  >
                    {mode.label}
                    {modeStatus[mode.id] ? ' ✓' : ''}
                  </button>
                )
              })}
            </div>

            {syncMessage ? <p className="mt-4 text-sm text-rose-700">{syncMessage}</p> : null}

            {activeMode === 'read' ? (
              <ReadMode
                markdown={step.readMarkdown}
                onComplete={() => void handleModeComplete('read')}
                isCompleted={modeStatus.read}
              />
            ) : null}
            {activeMode === 'practice' ? (
              <PracticeMode stepId={step.id} questions={step.practiceQuestions} onComplete={() => void handleModeComplete('practice')} />
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
                    ? `チャレンジ完了。次は「${nextStep.title}」へ進めます。`
                    : 'チャレンジ完了。現在の学習フローはすべて完了しています。'}
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
          <Link className="font-medium text-blue-700 underline" to="/">
            ダッシュボードへ戻る
          </Link>
        </div>

        {toastMessage ? (
          <div
            className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 shadow-xl"
            role="alert"
            aria-live="assertive"
          >
            <p className="font-semibold">学習達成</p>
            <p className="mt-1">{toastMessage}</p>
          </div>
        ) : null}
      </main>
    </div>
  )
}
