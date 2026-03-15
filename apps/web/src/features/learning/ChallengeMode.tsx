import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { ErrorBanner } from '../../components/ErrorBanner'
import type { ChallengePattern, ChallengeTask } from '../../content/fundamentals/steps'

const MonacoEditor = lazy(() => import('@monaco-editor/react'))

interface ChallengeModeProps {
  stepId: string
  task: ChallengeTask
  onComplete: () => void
  onSubmitResult?: (result: { code: string; isPassed: boolean; matchedKeywords: string[] }) => Promise<void> | void
}

function getRandomPattern(task: ChallengeTask): ChallengePattern {
  const randomIndex = Math.floor(Math.random() * task.patterns.length)
  return task.patterns[randomIndex]
}

export function ChallengeMode({ stepId, task, onComplete, onSubmitResult }: ChallengeModeProps) {
  const [pattern, setPattern] = useState<ChallengePattern>(() => getRandomPattern(task))
  const [code, setCode] = useState(() => pattern.starterCode)
  const [checked, setChecked] = useState(false)
  const [reported, setReported] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  useEffect(() => {
    const nextPattern = getRandomPattern(task)
    setPattern(nextPattern)
    setCode(nextPattern.starterCode)
    setChecked(false)
    setReported(false)
    setSubmissionError(null)
  }, [stepId, task])

  const missingKeywords = useMemo(
    () => pattern.expectedKeywords.filter((keyword) => !code.toLowerCase().includes(keyword.toLowerCase())),
    [code, pattern.expectedKeywords],
  )
  const hasSatisfiedRequirements = missingKeywords.length === 0
  const isPassed = checked && hasSatisfiedRequirements

  async function handleCheck() {
    const matchedKeywords = pattern.expectedKeywords.filter((keyword) =>
      code.toLowerCase().includes(keyword.toLowerCase()),
    )

    setChecked(true)
    setSubmissionError(null)

    if (onSubmitResult) {
      try {
        await onSubmitResult({
          code,
          isPassed: hasSatisfiedRequirements,
          matchedKeywords,
        })
      } catch (error) {
        setSubmissionError(error instanceof Error ? error.message : '提出履歴の保存に失敗しました。')
      }
    }

    if (hasSatisfiedRequirements && !reported) {
      onComplete()
      setReported(true)
    }
  }

  function handleCodeChange(nextValue: string | undefined) {
    setChecked(false)
    setCode(nextValue ?? '')
  }

  return (
    <section className="mt-4 space-y-4">
      <h2 className="text-lg font-semibold">Challenge</h2>
      <p className="text-sm text-slate-700">{pattern.prompt}</p>

      <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
        {pattern.requirements.map((requirement) => (
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
          className="rounded-md bg-primary-mint px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-dark active:bg-emerald-700"
          type="button"
          onClick={() => void handleCheck()}
        >
          判定する
        </button>

        {checked && (
          <p
            className={`text-sm font-medium ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}
            role="status"
            aria-live="polite"
          >
            {isPassed ? '🎉 Challengeを完了しました！' : '❌ 要件を満たしていません。'}
          </p>
        )}
      </div>

      {submissionError ? <ErrorBanner>{submissionError}</ErrorBanner> : null}

      {checked && !isPassed ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-4">
          <p className="text-sm font-medium text-rose-700">不足キーワードがあります:</p>
          <ul className="mt-2 list-inside list-disc text-sm text-rose-700">
            {missingKeywords.map((keyword) => (
              <li key={keyword}>{keyword}</li>
            ))}
          </ul>
          {pattern.hints.length > 0 && <p className="mt-2 text-sm text-rose-700">ヒント: {pattern.hints[0]}</p>}
        </div>
      ) : null}
    </section>
  )
}
