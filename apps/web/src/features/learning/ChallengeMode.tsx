import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import { CodeEditor } from '../../components/CodeEditor'
import { ErrorBanner } from '../../components/ErrorBanner'
import { useIsMobile } from '../../hooks/useIsMobile'
import type { ChallengePattern, ChallengeTask } from '../../content/fundamentals/steps'
import { JudgmentResult } from './components/JudgmentResult'
import { getMissingKeywords } from './utils/keywordMatcher'

interface ChallengeModeProps {
  stepId: string
  task: ChallengeTask
  onComplete: () => void
  onSubmitResult?: (result: { code: string; isPassed: boolean; matchedKeywords: string[] }) => Promise<void> | void
}

function getRandomPattern(task: ChallengeTask): ChallengePattern {
  const randomIndex = Math.floor(Math.random() * task.patterns.length)
  const pattern = task.patterns[randomIndex]
  if (!pattern) throw new Error(`No pattern at index ${randomIndex}`)
  return pattern
}

export function ChallengeMode({ stepId, task, onComplete, onSubmitResult }: ChallengeModeProps) {
  const isMobile = useIsMobile()
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
    () => getMissingKeywords(code, pattern.expectedKeywords),
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

  function handleCodeChange(nextValue: string) {
    setChecked(false)
    setCode(nextValue)
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
        <CodeEditor
          value={code}
          onChange={handleCodeChange}
          language="typescript"
          height={isMobile ? 'min(50vh, 300px)' : '320px'}
          toolbarKeywords={pattern.expectedKeywords}
        />
      </div>

      <div className="flex flex-col items-start gap-4 pt-4 sm:flex-row sm:items-center">
        <Button size="lg" onClick={() => void handleCheck()}>
          判定する
        </Button>

        {checked && (
          <JudgmentResult
            isPassed={isPassed}
            passedMessage="Challengeを完了しました！"
            failedMessage="要件を満たしていません。"
            failedHint="下記の不足要件を確認して、もう一度挑戦してみましょう。"
          />
        )}
      </div>

      {submissionError ? <ErrorBanner>{submissionError}</ErrorBanner> : null}

      {checked && !isPassed ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4" role="alert">
          <p className="text-sm font-semibold text-rose-800">以下の要件が未達成です:</p>
          <ul className="mt-2 list-inside list-disc text-sm text-rose-700">
            {missingKeywords.map((keyword) => (
              <li key={keyword}>{keyword}</li>
            ))}
          </ul>
          {pattern.hints.length > 0 && (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              ヒント: {pattern.hints[0]}
            </p>
          )}
        </div>
      ) : null}
    </section>
  )
}
