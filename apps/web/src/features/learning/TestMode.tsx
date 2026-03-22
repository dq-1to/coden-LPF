import { Fragment, useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import type { TestTask } from '../../content/fundamentals/steps'
import { addToReviewList, removeFromReviewList } from '../../services/reviewListService'
import { previewByStepId } from './testModePreview'

interface TestModeProps {
  stepId: string
  task: TestTask
  onComplete: () => void
}

export function TestMode({ stepId, task, onComplete }: TestModeProps) {
  const [blankInput, setBlankInput] = useState('')
  const [isJudged, setIsJudged] = useState(false)
  const [reported, setReported] = useState(false)

  useEffect(() => {
    setBlankInput('')
    setIsJudged(false)
    setReported(false)
  }, [stepId])

  const mergedCode = useMemo(() => task.starterCode.replace('____', blankInput), [blankInput, task.starterCode])
  const isPassed = useMemo(
    () =>
      blankInput.length > 0 &&
      task.expectedKeywords.every((keyword) => mergedCode.toLowerCase().includes(keyword.toLowerCase())),
    [blankInput, mergedCode, task.expectedKeywords],
  )

  function handleJudge() {
    setIsJudged(true)
    if (isPassed) {
      removeFromReviewList(stepId)
      if (!reported) {
        onComplete()
        setReported(true)
      }
    } else {
      addToReviewList(stepId)
    }
  }

  function handleInputChange(value: string) {
    setIsJudged(false)
    setBlankInput(value)
  }

  const parts = task.starterCode.split('____')

  const preview = previewByStepId[stepId]

  return (
    <section className="mt-4 space-y-4">
      <h2 className="text-lg font-semibold">Test</h2>
      <p className="text-sm text-slate-700">{task.instruction}</p>

      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-slate-300 bg-slate-900 p-4 font-mono text-sm leading-relaxed text-slate-100">
        {parts.map((part, index) => (
          <Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <input
                className={`mx-1 inline-block w-full max-w-xs rounded bg-slate-800 px-2 py-0.5 text-emerald-300 outline-none ring-1 placeholder:text-slate-500 focus:ring-2 sm:w-64 ${isJudged
                  ? isPassed
                    ? 'ring-emerald-500 focus:ring-emerald-400'
                    : 'ring-rose-500 focus:ring-rose-400'
                  : 'ring-slate-500 focus:ring-primary-mint'
                  }`}
                placeholder="コードを入力"
                aria-label="コードの空欄を入力"
                value={blankInput}
                onChange={(event) => handleInputChange(event.target.value)}
              />
            )}
          </Fragment>
        ))}
      </pre>

      <div className="flex flex-col items-start gap-4 pt-4 sm:flex-row sm:items-center">
        <Button size="lg" onClick={handleJudge}>
          判定する
        </Button>

        {isJudged && (
          <div
            className={`animate-fadeIn rounded-xl border px-4 py-3 ${isPassed ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}
            role="status"
            aria-live="polite"
          >
            <p className={`text-sm font-semibold ${isPassed ? 'text-emerald-800' : 'text-rose-800'}`}>
              {isPassed ? 'テスト合格！ ライブプレビューが解禁されました。' : '必要キーワードを満たしていません。'}
            </p>
            {!isPassed && (
              <p className="mt-1 text-xs text-rose-700">コードを見直して、もう一度試してください。</p>
            )}
          </div>
        )}
      </div>

      {isJudged && !isPassed && task.explanation ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs font-semibold text-amber-700">解説</p>
          <p className="mt-0.5 text-sm text-amber-900">{task.explanation}</p>
        </div>
      ) : null}

      {isJudged && isPassed && preview ? (
        <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">{preview.title}</p>
          <p className="mt-1 text-sm text-emerald-700">{preview.description}</p>
        </div>
      ) : null}
    </section>
  )
}
