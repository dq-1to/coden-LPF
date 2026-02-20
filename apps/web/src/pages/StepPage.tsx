import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LearningSidebar } from '../components/LearningSidebar'
import { fundamentalsSteps, getFundamentalsStep, type LearningMode } from '../content/fundamentals/steps'
import { useAuth } from '../contexts/AuthContext'

export function StepPage() {
  const { stepId = '' } = useParams()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [activeMode, setActiveMode] = useState<LearningMode>('read')
  const [practiceDraft, setPracticeDraft] = useState('')
  const [showHint, setShowHint] = useState(false)

  const step = getFundamentalsStep(stepId)

  useEffect(() => {
    setActiveMode('read')
    setPracticeDraft('')
    setShowHint(false)
  }, [stepId])

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

  const modeButtons: { id: LearningMode; label: string }[] = [
    { id: 'read', label: 'Read' },
    { id: 'practice', label: 'Practice' },
    { id: 'test', label: 'Test' },
    { id: 'challenge', label: 'Challenge' },
  ]

  const currentPractice = step.practiceQuestions[0]

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
                </button>
              )
            })}
          </div>

          {activeMode === 'read' ? (
            <section className="mt-4 space-y-3">
              <h2 className="text-lg font-semibold">Read</h2>
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-800">
                {step.readMarkdown}
              </pre>
            </section>
          ) : null}

          {activeMode === 'practice' ? (
            <section className="mt-4 space-y-3">
              <h2 className="text-lg font-semibold">Practice</h2>
              <p className="text-sm text-slate-700">{currentPractice.prompt}</p>
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="回答を入力"
                value={practiceDraft}
                onChange={(event) => setPracticeDraft(event.target.value)}
              />
              <button
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
              >
                ヒントを{showHint ? '隠す' : '表示'}
              </button>
              {showHint ? <p className="text-sm text-blue-700">{currentPractice.hint}</p> : null}
            </section>
          ) : null}

          {activeMode === 'test' ? (
            <section className="mt-4 space-y-3">
              <h2 className="text-lg font-semibold">Test</h2>
              <p className="text-sm text-slate-700">{step.testTask.instruction}</p>
              <pre className="rounded-lg bg-slate-50 p-4 text-sm text-slate-800">{step.testTask.starterCode}</pre>
            </section>
          ) : null}

          {activeMode === 'challenge' ? (
            <section className="mt-4 space-y-3">
              <h2 className="text-lg font-semibold">Challenge</h2>
              <p className="text-sm text-slate-700">{step.challengeTask.prompt}</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
                {step.challengeTask.requirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </section>
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
