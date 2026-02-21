import { Suspense, lazy, useMemo, useState } from 'react'
import type { ChallengeTask } from '../../content/fundamentals/steps'

const MonacoEditor = lazy(() => import('@monaco-editor/react'))

interface ChallengeModeProps {
  task: ChallengeTask
  onComplete: () => void
}

export function ChallengeMode({ task, onComplete }: ChallengeModeProps) {
  const [code, setCode] = useState(`export function Solution() {\n  return <div>TODO</div>\n}`)
  const [checked, setChecked] = useState(false)

  const missingKeywords = useMemo(
    () => task.expectedKeywords.filter((keyword) => !code.toLowerCase().includes(keyword.toLowerCase())),
    [code, task.expectedKeywords],
  )
  const isPassed = checked && missingKeywords.length === 0

  function handleCheck() {
    setChecked(true)
    if (isPassed) {
      onComplete()
    }
  }

  function handleCodeChange(nextValue: string | undefined) {
    setChecked(false)
    setCode(nextValue ?? '')
  }

  return (
    <section className="mt-4 space-y-4">
      <h2 className="text-lg font-semibold">Challenge</h2>
      <p className="text-sm text-slate-700">{task.prompt}</p>

      <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
        {task.requirements.map((requirement) => (
          <li key={requirement}>{requirement}</li>
        ))}
      </ul>

      <div className="overflow-hidden rounded-lg border border-slate-300">
        <Suspense fallback={<div className="bg-slate-900 p-4 text-sm text-slate-100">エディタを読み込み中...</div>}>
          <MonacoEditor
            defaultLanguage="typescript"
            height="320px"
            theme="vs-dark"
            value={code}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
            onChange={handleCodeChange}
          />
        </Suspense>
      </div>

      <div className="flex flex-col items-start gap-4 pt-4 sm:flex-row sm:items-center">
        <button
          className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-500 active:bg-blue-700"
          type="button"
          onClick={handleCheck}
        >
          判定する
        </button>

        {checked && (
          <p className={`text-sm font-medium ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
            {isPassed ? '🎉 Challengeを完了しました！' : '❌ 要件を満たしていません。'}
          </p>
        )}
      </div>

      {checked && !isPassed ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-4">
          <p className="text-sm font-medium text-rose-700">不足キーワードがあります:</p>
          <ul className="mt-2 list-inside list-disc text-sm text-rose-700">
            {missingKeywords.map((keyword) => (
              <li key={keyword}>{keyword}</li>
            ))}
          </ul>
          {task.hints.length > 0 && <p className="mt-2 text-sm text-rose-700">ヒント: {task.hints[0]}</p>}
        </div>
      ) : null}
    </section>
  )
}
