interface SuccessViewProps {
  message: string
}

/**
 * API 成功時の表示コンポーネント
 *
 * コース4の各ステップで「成功状態」の UI パターンを示す際に使用する。
 */
export function SuccessView({ message }: SuccessViewProps) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
      <p className="text-sm font-medium text-emerald-700">{message}</p>
    </div>
  )
}
