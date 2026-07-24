import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { CodeEditor } from '../../components/CodeEditor'
import { ErrorBanner } from '../../components/ErrorBanner'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { useIsMobile } from '../../hooks/useIsMobile'
import { resolvePrimaryPattern, type ChallengePattern, type ChallengeTask } from '../../content/fundamentals/steps'
import { JudgmentResult } from './components/JudgmentResult'
import { SolutionDisclosure } from './components/SolutionDisclosure'
import { useJudgmentAction } from './hooks/useJudgmentAction'
import { useChallengeDraft } from './hooks/useChallengeDraft'
import { judgeKeywordConditions, judgeKeywords, stripNonAuthoredCode } from '../../lib/judge'
import { ChallengePuzzleMulti } from './ChallengePuzzle/ChallengePuzzleMulti'
import { isExecPreviewEnabled } from './execPreview/execPreviewConfig'

const ChallengeExecutionPreview = lazy(() => import('./execPreview/ChallengeExecutionPreview'))
const EXEC_PREVIEW_TIMEOUT_MS = 15_000

type ExecutionPreviewState =
  | { status: 'idle' }
  | { status: 'preparing'; runId: number }
  | { status: 'ready'; runId: number }
  | { status: 'error'; runId: number; message: string }

interface PreviewLoadErrorProps {
  runId: number
  onError: (runId: number, message: string) => void
}

function PreviewLoadError({ runId, onError }: PreviewLoadErrorProps) {
  useEffect(() => {
    onError(runId, 'プレビュー機能の読み込みに失敗しました。')
  }, [onError, runId])

  return null
}

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
  const showExecPreview = isExecPreviewEnabled(stepId) && !hasMobilePuzzle
  // モバイルパズルは組み立て式のため自由入力 draft の対象外（PC自由入力を主対象とする）
  const { readDraft, scheduleSave, clearDraft } = useChallengeDraft({ enabled: !hasMobilePuzzle })
  const [code, setCode] = useState(() => readDraft(stepId, pattern.id) ?? pattern.starterCode)
  const [checked, setChecked] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [previewCode, setPreviewCode] = useState<string | null>(null)
  const [previewState, setPreviewState] = useState<ExecutionPreviewState>({ status: 'idle' })
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const nextPreviewRunIdRef = useRef(0)
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
    setPreviewCode(null)
    setPreviewState({ status: 'idle' })
    setIsPreviewVisible(false)
  }, [stepId, task])

  const handlePreviewReady = useCallback((runId: number) => {
    setPreviewState((current) =>
      current.status === 'preparing' && current.runId === runId
        ? { status: 'ready', runId }
        : current,
    )
  }, [])

  const handlePreviewError = useCallback((runId: number, message: string) => {
    setIsPreviewVisible(false)
    setPreviewState((current) =>
      (current.status === 'preparing' || current.status === 'ready') &&
      current.runId === runId
        ? { status: 'error', runId, message }
        : current,
    )
  }, [])

  useEffect(() => {
    if (previewState.status !== 'preparing') return

    const timeoutId = window.setTimeout(() => {
      handlePreviewError(
        previewState.runId,
        'プレビューの準備がタイムアウトしました。もう一度お試しください。',
      )
    }, EXEC_PREVIEW_TIMEOUT_MS)

    return () => window.clearTimeout(timeoutId)
  }, [handlePreviewError, previewState])

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

      if (showExecPreview) {
        const runId = nextPreviewRunIdRef.current + 1
        nextPreviewRunIdRef.current = runId
        setPreviewCode(code)
        setPreviewState({ status: 'preparing', runId })
        setIsPreviewVisible(false)
      }
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
      setPreviewCode(null)
      setPreviewState({ status: 'idle' })
      setIsPreviewVisible(false)
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

      {showExecPreview && previewState.status !== 'idle' ? (
        <div className="space-y-2">
          {previewState.status === 'preparing' ? (
            <Button variant="secondary" disabled>
              プレビューを準備中…
            </Button>
          ) : null}

          {previewState.status === 'ready' ? (
            <Button
              variant="secondary"
              onClick={() => setIsPreviewVisible((current) => !current)}
            >
              {isPreviewVisible ? 'プレビューを閉じる' : 'プレビューを見る'}
            </Button>
          ) : null}

          {previewState.status === 'error' ? (
            <>
              <p className="text-sm text-red-600" role="alert">
                {previewState.message}
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  if (previewCode === null) return
                  const runId = nextPreviewRunIdRef.current + 1
                  nextPreviewRunIdRef.current = runId
                  setPreviewState({ status: 'preparing', runId })
                }}
              >
                プレビューを再試行
              </Button>
            </>
          ) : null}

          <p className="sr-only" role="status" aria-live="polite">
            {previewState.status === 'preparing'
              ? 'プレビューを準備しています。'
              : previewState.status === 'ready'
                ? 'プレビューの準備が完了しました。'
                : previewState.status === 'error'
                  ? previewState.message
                  : ''}
          </p>

          {previewCode !== null ? (
            <ErrorBoundary
              key={previewState.runId}
              fallback={
                <PreviewLoadError
                  runId={previewState.runId}
                  onError={handlePreviewError}
                />
              }
            >
              <Suspense fallback={null}>
                <ChallengeExecutionPreview
                  code={previewCode}
                  isVisible={isPreviewVisible && previewState.status === 'ready'}
                  runId={previewState.runId}
                  onReady={handlePreviewReady}
                  onError={handlePreviewError}
                />
              </Suspense>
            </ErrorBoundary>
          ) : null}
        </div>
      ) : null}

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
