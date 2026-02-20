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
    if (missingKeywords.length === 0) {
      onComplete()
    }
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
            onChange={(nextValue) => setCode(nextValue ?? '')}
          />
        </Suspense>
      </div>

      <button
        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
        type="button"
        onClick={handleCheck}
      >
        キーワードチェック
      </button>

      {checked ? (
        <div className={`rounded-lg border p-4 ${isPassed ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
          {isPassed ? (
            <p className="text-sm font-medium text-emerald-700">Challengeを完了しました。</p>
          ) : (
            <>
              <p className="text-sm font-medium text-rose-700">不足キーワードがあります。</p>
              <ul className="mt-2 list-inside list-disc text-sm text-rose-700">
                {missingKeywords.map((keyword) => (
                  <li key={keyword}>{keyword}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-rose-700">ヒント: {task.hints[0]}</p>
            </>
          )}
        </div>
      ) : null}
    </section>
  )
}
