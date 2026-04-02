import { CheckCircle } from 'lucide-react'

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
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-8 text-center shadow-sm">
      <CheckCircle className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
      <h2 className="mb-1 text-lg font-bold text-emerald-700">今日のチャレンジは完了です！</h2>
      <p className="mb-4 text-sm text-slate-500">
        {formattedDate}
        {formattedTime ? ` ${formattedTime}` : ''} に達成
      </p>
      {pointsEarned > 0 && (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
          +{pointsEarned} Pt 獲得
        </div>
      )}
      <p className="mt-5 text-sm text-slate-500">明日またチャレンジしましょう</p>
    </div>
  )
}
