interface CompletedViewProps {
  completedAt: string | null
  pointsEarned: number
  dateStr: string
}

export function CompletedView({ completedAt, pointsEarned, dateStr }: CompletedViewProps) {
  const formattedDate = dateStr.replace(/-/g, '/')
  const formattedTime = completedAt
    ? new Date(completedAt).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center shadow-sm">
      <div className="mb-3 text-4xl">✅</div>
      <h2 className="mb-1 text-lg font-bold text-green-700">今日のチャレンジは完了です！</h2>
      <p className="mb-4 text-sm text-text-muted">
        {formattedDate}
        {formattedTime ? ` ${formattedTime}` : ''} に達成
      </p>
      {pointsEarned > 0 && (
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
          +{pointsEarned} Pt 獲得
        </div>
      )}
      <p className="mt-4 text-sm text-text-muted">明日またチャレンジしてください 🔥</p>
    </div>
  )
}
