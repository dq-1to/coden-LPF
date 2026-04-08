interface ErrorViewProps {
  message: string
  onRetry?: () => void
}

/**
 * API エラー時の表示コンポーネント
 *
 * コース4の各ステップで「エラー状態」の UI パターンを示す際に使用する。
 */
export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3" role="alert">
      <p className="text-sm font-medium text-rose-700">{message}</p>
      {onRetry ? (
        <button
          className="mt-2 min-h-[44px] text-xs font-medium text-rose-600 underline hover:text-rose-800"
          type="button"
          onClick={onRetry}
        >
          再試行する
        </button>
      ) : null}
    </div>
  )
}
