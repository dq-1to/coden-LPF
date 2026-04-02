import { Fragment, Suspense, useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import type { TestTask } from '../../content/fundamentals/steps'
import { JudgmentResult } from './components/JudgmentResult'
import { useJudgmentAction } from './hooks/useJudgmentAction'
import { useStepReset } from './hooks/useStepReset'
import { previewByStepId } from './testModePreview'
import { previewComponentByStepId } from './previews'

interface TestModeProps {
  stepId: string
  task: TestTask
  onComplete: () => void
}

export function TestMode({ stepId, task, onComplete }: TestModeProps) {
  const [blankInput, setBlankInput] = useState('')
  const [isJudged, setIsJudged] = useState(false)
  const { handleResult } = useJudgmentAction(stepId, onComplete)

  useStepReset(stepId, () => {
    setBlankInput('')
    setIsJudged(false)
  })

  const mergedCode = useMemo(() => task.starterCode.replace('____', blankInput), [blankInput, task.starterCode])
  const isPassed = useMemo(
    () =>
      blankInput.length > 0 &&
      task.expectedKeywords.every((keyword) => mergedCode.toLowerCase().includes(keyword.toLowerCase())),
    [blankInput, mergedCode, task.expectedKeywords],
  )

  function handleJudge() {
    setIsJudged(true)
    handleResult(isPassed)
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
          <JudgmentResult
            isPassed={isPassed}
            passedMessage="テスト合格！ ライブプレビューが解禁されました。"
            failedMessage="必要キーワードを満たしていません。"
            failedHint="コードを見直して、もう一度試してください。"
          />
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
          {previewComponentByStepId[stepId] ? (
            <div className="mt-3 rounded-md border border-emerald-200 bg-white p-4">
              <ErrorBoundary fallback={<p className="text-sm text-red-600">プレビューの表示中にエラーが発生しました。</p>}>
                <Suspense
                  fallback={
                    <p className="text-xs text-slate-400">プレビューを読み込み中…</p>
                  }
                >
                  {(() => {
                    const PreviewComponent = previewComponentByStepId[stepId]
                    return <PreviewComponent />
                  })()}
                </Suspense>
              </ErrorBoundary>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
