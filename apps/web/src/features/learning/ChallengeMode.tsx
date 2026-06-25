import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { CodeEditor } from '../../components/CodeEditor'
import { ErrorBanner } from '../../components/ErrorBanner'
import { useIsMobile } from '../../hooks/useIsMobile'
import { resolvePrimaryPattern, type ChallengePattern, type ChallengeTask } from '../../content/fundamentals/steps'
import { JudgmentResult } from './components/JudgmentResult'
import { SolutionDisclosure } from './components/SolutionDisclosure'
import { useJudgmentAction } from './hooks/useJudgmentAction'
import { useChallengeDraft } from './hooks/useChallengeDraft'
import { judgeKeywordConditions, judgeKeywords, stripNonAuthoredCode } from '../../lib/judge'
import { ChallengePuzzleMulti } from './ChallengePuzzle/ChallengePuzzleMulti'

interface ChallengeModeProps {
  stepId: string
  task: ChallengeTask
  onComplete: () => void
  onSubmitResult?: (result: { code: string; isPassed: boolean; matchedKeywords: string[]; patternId: string }) => Promise<void> | void
}

export function ChallengeMode({ stepId, task, onComplete, onSubmitResult }: ChallengeModeProps) {
  const isMobile = useIsMobile()
  const [pattern, setPattern] = useState<ChallengePattern>(() => resolvePrimaryPattern(task))
  const hasMobilePuzzle = isMobile && pattern.mobilePuzzle != null
  // モバイルパズルは組み立て式のため自由入力 draft の対象外（PC自由入力を主対象とする）
  const { readDraft, scheduleSave, clearDraft } = useChallengeDraft({ enabled: !hasMobilePuzzle })
  const [code, setCode] = useState(() => readDraft(stepId, pattern.id) ?? pattern.starterCode)
  const [checked, setChecked] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const { handleResult } = useJudgmentAction(stepId, 'challenge', onComplete)

  // effect 内で最新の readDraft を参照しつつ、依存は [stepId, task] に保つ
  const readDraftRef = useRef(readDraft)
  readDraftRef.current = readDraft

  useEffect(() => {
    const nextPattern = resolvePrimaryPattern(task)
    setPattern(nextPattern)
    setCode(readDraftRef.current(stepId, nextPattern.id) ?? nextPattern.starterCode)
    setChecked(false)
    setSubmissionError(null)
  }, [stepId, task])

  // starterCode の TODO コメントや import 由来の誤合格を防ぐため、判定はサニタイズ後コードで行う
  const judgeableCode = useMemo(() => stripNonAuthoredCode(code), [code])

  const judgement = useMemo(
    () =>
      judgeKeywords(judgeableCode, {
        requiredKeywords: pattern.expectedKeywords,
        ngKeywords: pattern.ngKeywords,
        anyOf: pattern.anyOf,
        passThreshold: pattern.passThreshold,
      }),
    [judgeableCode, pattern.expectedKeywords, pattern.ngKeywords, pattern.anyOf, pattern.passThreshold],
  )

  // 条件メタ情報があれば、不足を日本語ラベルで表示するために条件単位でも判定する（表示専用）
  const unsatisfiedConditions = useMemo(() => {
    if (!pattern.conditions || pattern.conditions.length === 0) return []
    return judgeKeywordConditions(judgeableCode, pattern.conditions).unsatisfiedConditions
  }, [judgeableCode, pattern.conditions])

  const missingKeywords = judgement.missing
  const violations = judgement.violations
  const hasSatisfiedRequirements = judgement.passed
  const isPassed = checked && hasSatisfiedRequirements

  async function handleCheck() {
    const matchedKeywords = judgement.matched

    setChecked(true)
    setSubmissionError(null)

    // 正解した場合は途中コードの draft を削除する
    if (hasSatisfiedRequirements) {
      clearDraft(stepId, pattern.id)
    }

    if (onSubmitResult) {
      try {
        await onSubmitResult({
          code,
          isPassed: hasSatisfiedRequirements,
          matchedKeywords,
          patternId: pattern.id,
        })
      } catch (error) {
        setSubmissionError(error instanceof Error ? error.message : '提出履歴の保存に失敗しました。')
      }
    }

    await handleResult(hasSatisfiedRequirements, {
      questionId: pattern.id,
      expected: pattern.expectedKeywords.join(', '),
      userInput: code,
    })
  }

  const handleCodeChange = useCallback(
    (nextValue: string) => {
      setChecked(false)
      setCode(nextValue)
      scheduleSave(stepId, pattern.id, nextValue)
    },
    [scheduleSave, stepId, pattern.id],
  )

  return (
    <section className="mt-4 space-y-4">
      <h2 className="text-lg font-semibold">Challenge</h2>
      <p className="text-sm text-slate-700">{pattern.prompt}</p>

      <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
        {pattern.requirements.map((requirement) => (
          <li key={requirement}>{requirement}</li>
        ))}
      </ul>

      {hasMobilePuzzle && pattern.mobilePuzzle ? (
        <ChallengePuzzleMulti puzzle={pattern.mobilePuzzle} onCodeChange={handleCodeChange} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-300">
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            language="typescript"
            height={isMobile ? 'min(50vh, 300px)' : '320px'}
            toolbarKeywords={pattern.expectedKeywords}
          />
        </div>
      )}

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
          {unsatisfiedConditions.length > 0 ? (
            // 条件メタ情報がある場合は、日本語ラベル + 説明で不足を提示する
            <>
              <p className="text-sm font-semibold text-rose-800">以下の条件を満たせているか確認しましょう:</p>
              <ul className="mt-2 space-y-1.5 text-sm text-rose-700">
                {unsatisfiedConditions.map((condition) => (
                  <li key={condition.id}>
                    <span className="font-semibold">{condition.label}</span>
                    <span className="text-rose-600">: {condition.explanation}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            missingKeywords.length > 0 && (
              <>
                <p className="text-sm font-semibold text-rose-800">以下の要件が未達成です:</p>
                <ul className="mt-2 list-inside list-disc text-sm text-rose-700">
                  {missingKeywords.map((keyword) => (
                    <li key={keyword}>{keyword}</li>
                  ))}
                </ul>
              </>
            )
          )}
          {violations.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-amber-800">避けたい書き方が含まれています:</p>
              <ul className="mt-2 list-inside list-disc text-sm text-amber-700">
                {violations.map((keyword) => (
                  <li key={keyword}>{keyword}</li>
                ))}
              </ul>
            </div>
          )}
          {pattern.hints.length > 0 && (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              ヒント: {pattern.hints[0]}
            </p>
          )}
          {pattern.solutionCode ? <SolutionDisclosure solutionCode={pattern.solutionCode} /> : null}
        </div>
      ) : null}
    </section>
  )
}
