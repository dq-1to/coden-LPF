import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LearningSidebar } from '../components/LearningSidebar'
import { fundamentalsSteps, getFundamentalsStep, type LearningMode } from '../content/fundamentals/steps'
import { useAuth } from '../contexts/AuthContext'
import { ChallengeMode } from '../features/learning/ChallengeMode'
import { PracticeMode } from '../features/learning/PracticeMode'
import { ReadMode } from '../features/learning/ReadMode'
import { TestMode } from '../features/learning/TestMode'
import { getStepProgress, updateModeCompletion } from '../services/progressService'

type ModeStatus = Record<LearningMode, boolean>

const INITIAL_MODE_STATUS: ModeStatus = {
  read: false,
  practice: false,
  test: false,
  challenge: false,
}

export function StepPage() {
  const { stepId = '' } = useParams()
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [activeMode, setActiveMode] = useState<LearningMode>('read')
  const [modeStatus, setModeStatus] = useState<ModeStatus>(INITIAL_MODE_STATUS)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const step = getFundamentalsStep(stepId)

  useEffect(() => {
    setActiveMode('read')
    setSyncMessage(null)
  }, [stepId])

  useEffect(() => {
    const userId = user?.id ?? ''
    if (!step || userId.length === 0) {
      setModeStatus(INITIAL_MODE_STATUS)
      return
    }

    const currentStepId = step.id
    let isMounted = true

    async function loadStepProgress() {
      try {
        const progress = await getStepProgress(userId, currentStepId)
        if (!isMounted) {
          return
        }

        setModeStatus({
          read: progress?.read_done ?? false,
          practice: progress?.practice_done ?? false,
          test: progress?.test_done ?? false,
          challenge: progress?.challenge_done ?? false,
        })
      } catch (error) {
        if (!isMounted) {
          return
        }

        const message = error instanceof Error ? error.message : '進捗の取得に失敗しました。'
        setSyncMessage(message)
      }
    }

    void loadStepProgress()

    return () => {
      isMounted = false
    }
  }, [step, user?.id])

  const modeButtons: { id: LearningMode; label: string }[] = useMemo(
    () => [
      { id: 'read', label: 'Read' },
      { id: 'practice', label: 'Practice' },
      { id: 'test', label: 'Test' },
      { id: 'challenge', label: 'Challenge' },
    ],
    [],
  )

  const handleModeComplete = useCallback(
    async (mode: LearningMode) => {
      if (!step || !user?.id || modeStatus[mode]) {
        return
      }

      setModeStatus((prev) => ({ ...prev, [mode]: true }))
      setSyncMessage(null)

      try {
        await updateModeCompletion(user.id, step.id, mode)
      } catch (error) {
        setModeStatus((prev) => ({ ...prev, [mode]: false }))
        const message = error instanceof Error ? error.message : '進捗保存に失敗しました。'
        setSyncMessage(message)
      }
    },
    [modeStatus, step, user?.id],
  )

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
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
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{step.title}</h1>
          <p className="text-slate-600">{step.summary}</p>
        </div>
        <button
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          type="button"
          onClick={handleSignOut}
        >
          ログアウト
        </button>
      </header>

      <section className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <LearningSidebar currentStepId={stepId} steps={fundamentalsSteps} />

        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">stepId: {step.id}</p>

          <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
            {modeButtons.map((mode) => {
              const isActive = activeMode === mode.id
              return (
                <button
                  key={mode.id}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  type="button"
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
            <ReadMode markdown={step.readMarkdown} onComplete={() => void handleModeComplete('read')} />
          ) : null}
          {activeMode === 'practice' ? (
            <PracticeMode questions={step.practiceQuestions} onComplete={() => void handleModeComplete('practice')} />
          ) : null}
          {activeMode === 'test' ? (
            <TestMode stepId={step.id} task={step.testTask} onComplete={() => void handleModeComplete('test')} />
          ) : null}
          {activeMode === 'challenge' ? (
            <ChallengeMode task={step.challengeTask} onComplete={() => void handleModeComplete('challenge')} />
          ) : null}
        </div>
      </section>

      <div className="flex gap-4 text-sm">
        <Link className="font-medium text-blue-700 underline" to="/">
          ダッシュボードへ戻る
        </Link>
      </div>
    </main>
  )
}
