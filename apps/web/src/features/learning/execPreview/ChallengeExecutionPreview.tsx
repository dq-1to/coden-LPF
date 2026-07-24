import { useCallback, useEffect, useRef } from 'react'
import {
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react'
import { buildPreviewFiles } from './buildPreviewFiles'

interface ChallengeExecutionPreviewProps {
  code: string
  isVisible: boolean
  runId: number
  onReady: (runId: number) => void
  onError: (runId: number, message: string) => void
}

interface PreviewRuntimeProps {
  isVisible: boolean
  runId: number
  onReady: (runId: number) => void
  onError: (runId: number, message: string) => void
}

function PreviewRuntime({
  isVisible,
  runId,
  onReady,
  onError,
}: PreviewRuntimeProps) {
  const { sandpack, listen } = useSandpack()
  const runSandpackRef = useRef(sandpack.runSandpack)
  const listenRef = useRef(listen)
  const hasStartedRef = useRef(false)
  const hasReportedReadyRef = useRef(false)
  const hasReportedErrorRef = useRef(false)
  runSandpackRef.current = sandpack.runSandpack
  listenRef.current = listen

  const reportReady = useCallback(() => {
    if (hasReportedReadyRef.current || hasReportedErrorRef.current) return
    hasReportedReadyRef.current = true
    onReady(runId)
  }, [onReady, runId])

  const reportError = useCallback(
    (message: string) => {
      if (hasReportedErrorRef.current) return
      hasReportedErrorRef.current = true
      onError(runId, message)
    },
    [onError, runId],
  )

  useEffect(() => {
    const unsubscribe = listenRef.current((message) => {
      if (message.type === 'action' && message.action === 'show-error') {
        reportError('プレビューを準備できませんでした。コードの構文を確認してください。')
      }

      if (
        message.type === 'action' &&
        message.action === 'notification' &&
        message.notificationType === 'error'
      ) {
        reportError('プレビューの実行中にエラーが発生しました。')
      }

      if (message.type === 'done' && message.compilatonError) {
        reportError('プレビューを準備できませんでした。コードの構文を確認してください。')
      }

      if (message.type === 'done' && !message.compilatonError) {
        reportReady()
      }
    })

    // listen は過去の done を再送しないため、購読完了後にだけ手動実行を予約する。
    // StrictMode の最初の effect は cleanup でタイマーが破棄される。
    // 最終マウント後のタイマーだけが発火し、手動実行を1回に限定する。
    const startTimer = window.setTimeout(() => {
      if (hasStartedRef.current) return
      hasStartedRef.current = true
      void runSandpackRef.current().catch(() => {
        reportError('プレビューの実行を開始できませんでした。')
      })
    }, 0)

    return () => {
      window.clearTimeout(startTimer)
      unsubscribe()
    }
  }, [reportError, reportReady])

  useEffect(() => {
    if (!hasStartedRef.current) return

    if (sandpack.status === 'timeout') {
      reportError('プレビューの準備がタイムアウトしました。')
    }
  }, [reportError, sandpack.status])

  return (
    <div
      aria-hidden={!isVisible}
      className={
        isVisible
          ? 'overflow-hidden rounded-lg border border-slate-300'
          : 'pointer-events-none fixed left-[-10000px] top-0 h-[320px] w-[640px] overflow-hidden opacity-0'
      }
    >
      <SandpackPreview
        showOpenInCodeSandbox={false}
        showRefreshButton={false}
        style={{ height: 320 }}
      />
    </div>
  )
}

export default function ChallengeExecutionPreview({
  code,
  isVisible,
  runId,
  onReady,
  onError,
}: ChallengeExecutionPreviewProps) {
  return (
    <SandpackProvider
      template="react-ts"
      files={buildPreviewFiles(code)}
      options={{
        autorun: false,
        autoReload: false,
        initMode: 'immediate',
      }}
    >
      <PreviewRuntime
        isVisible={isVisible}
        runId={runId}
        onReady={onReady}
        onError={onError}
      />
    </SandpackProvider>
  )
}
