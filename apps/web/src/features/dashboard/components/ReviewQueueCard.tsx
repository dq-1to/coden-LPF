import { Link } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { findStepById } from '@/content/courseData'
import type { ReviewItem } from '@/services/reviewService'

interface ReviewQueueCardProps {
  dueCount: number
  scheduledCount: number
  firstItem: ReviewItem | null
  isLoading?: boolean
  error?: string | null
}

function formatCount(count: number) {
  return count > 99 ? '99+' : String(count)
}

function getReviewPath(item: ReviewItem | null) {
  if (!item) return '/curriculum'

  const mode = item.mode === 'daily' ? 'practice' : item.mode
  return `/step/${item.step_id}?mode=${mode}`
}

export function ReviewQueueCard({
  dueCount,
  scheduledCount,
  firstItem,
  isLoading = false,
  error = null,
}: ReviewQueueCardProps) {
  const firstStep = firstItem ? findStepById(firstItem.step_id) : undefined
  const hasDueItems = dueCount > 0
  const reviewPath = getReviewPath(firstItem)

  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2.5">
            <RotateCcw className="h-5 w-5 text-amber-700" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">復習キュー</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {isLoading ? '今日の復習を確認中' : `今日の復習 ${formatCount(dueCount)} 件`}
            </h2>
            {error ? (
              <p className="mt-1 text-sm text-rose-600">{error}</p>
            ) : hasDueItems ? (
              <p className="mt-1 text-sm text-slate-600">
                最優先: {firstStep ? `Step ${firstStep.order}「${firstStep.title}」` : firstItem?.step_id}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-600">今日の復習はありません。</p>
            )}
            {scheduledCount > 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                期日前の復習が {scheduledCount} 件あります。予定日になったら表示されます。
              </p>
            ) : null}
          </div>
        </div>

        <Link
          to={hasDueItems ? reviewPath : '/curriculum'}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          {hasDueItems ? '復習へ進む' : '学習を進める'}
        </Link>
      </div>
    </section>
  )
}
