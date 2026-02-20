import { useEffect, useMemo, useState } from 'react'
import type { TestTask } from '../../content/fundamentals/steps'

interface TestModeProps {
  stepId: string
  task: TestTask
  onComplete: () => void
}

const previewByStepId: Record<string, { title: string; description: string }> = {
  'usestate-basic': {
    title: 'Counter Preview',
    description: 'クリックでカウントが増えるUIを確認できる状態です。',
  },
  events: {
    title: 'Event Preview',
    description: 'イベントハンドラが接続された状態です。',
  },
  conditional: {
    title: 'Conditional Preview',
    description: '条件分岐に応じて表示切り替えが動作する状態です。',
  },
  lists: {
    title: 'List Preview',
    description: 'リスト描画とkey設定が有効です。',
  },
}

export function TestMode({ stepId, task, onComplete }: TestModeProps) {
  const [blankInput, setBlankInput] = useState('')
  const [reported, setReported] = useState(false)

  const mergedCode = useMemo(() => task.starterCode.replace('____', blankInput), [blankInput, task.starterCode])
  const isPassed = useMemo(
    () =>
      blankInput.length > 0 &&
      task.expectedKeywords.every((keyword) => mergedCode.toLowerCase().includes(keyword.toLowerCase())),
    [blankInput, mergedCode, task.expectedKeywords],
  )

  useEffect(() => {
    if (isPassed && !reported) {
      onComplete()
      setReported(true)
    }
  }, [isPassed, onComplete, reported])

  const preview = previewByStepId[stepId]

  return (
    <section className="mt-4 space-y-4">
      <h2 className="text-lg font-semibold">Test</h2>
      <p className="text-sm text-slate-700">{task.instruction}</p>

      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="text-sm font-medium text-slate-700" htmlFor="test-blank">
          空欄入力
        </label>
        <input
          id="test-blank"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="例: setCount(count + 1)"
          value={blankInput}
          onChange={(event) => setBlankInput(event.target.value)}
        />
      </div>

      <pre className="overflow-x-auto rounded-lg border border-slate-300 bg-slate-900 p-4 text-sm text-slate-100">
        {mergedCode}
      </pre>

      <p className={`text-sm font-medium ${isPassed ? 'text-emerald-700' : 'text-slate-600'}`}>
        {isPassed ? 'テスト合格。ライブプレビューが解禁されました。' : '必要キーワードを満たすと合格です。'}
      </p>

      {isPassed && preview ? (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">{preview.title}</p>
          <p className="text-sm text-emerald-700">{preview.description}</p>
        </div>
      ) : null}
    </section>
  )
}
