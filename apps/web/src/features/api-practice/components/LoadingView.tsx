interface LoadingViewProps {
  message?: string
}

/**
 * API 呼び出し中のローディング表示コンポーネント
 *
 * コース4の各ステップで「ローディング中」の UI パターンを示す際に使用する。
 */
export function LoadingView({ message = '読み込み中...' }: LoadingViewProps) {
  return (
    <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary-mint" />
      <span>{message}</span>
    </div>
  )
}
