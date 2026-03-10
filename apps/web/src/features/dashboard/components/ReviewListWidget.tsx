import { Link } from 'react-router-dom'
import { findStepMeta } from '@/content/courseData'
import { useReviewList } from '../hooks/useReviewList'

export function ReviewListWidget() {
  const { stepIds, removeStep } = useReviewList()

  if (stepIds.length === 0) {
    return null
  }

  return (
    <section className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-dark">復習リスト</h3>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
          {stepIds.length}件
        </span>
      </div>
      <ul className="space-y-2">
        {stepIds.map((stepId) => {
          const meta = findStepMeta(stepId)
          if (!meta) return null
          return (
            <li key={stepId} className="flex items-center justify-between gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
              <Link
                to={`/step/${stepId}`}
                className="flex-1 text-sm font-medium text-slate-700 hover:text-primary-dark hover:underline"
              >
                Step {meta.order}: {meta.title}
              </Link>
              <button
                type="button"
                className="shrink-0 rounded text-xs text-slate-400 hover:text-rose-500"
                aria-label={`${meta.title}を復習リストから削除`}
                onClick={() => removeStep(stepId)}
              >
                ✕
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
