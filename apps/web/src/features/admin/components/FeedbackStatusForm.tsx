import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  FEEDBACK_STATUS_LABELS,
  isFeedbackStatus,
  updateFeedbackStatus,
} from '../../../services/feedbackService'
import type { FeedbackStatus, UserFeedback } from '../../../services/feedbackService'

interface FeedbackStatusFormProps {
  feedback: UserFeedback
  adminUserId: string
  onUpdate: (updated: UserFeedback) => void
}

export function FeedbackStatusForm({ feedback, adminUserId, onUpdate }: FeedbackStatusFormProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextStatus = e.target.value
    if (!isFeedbackStatus(nextStatus)) return

    setIsUpdating(true)
    setError(null)
    try {
      const updated = await updateFeedbackStatus(feedback.id, nextStatus, adminUserId)
      onUpdate(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ステータスの更新に失敗しました')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">ステータス</h2>

      {error && (
        <div role="alert" className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      <div className="relative">
        <select
          value={feedback.status}
          onChange={(e) => void handleChange(e)}
          disabled={isUpdating}
          className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm text-slate-800 shadow-sm transition focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="ステータスを変更"
        >
          {(['new', 'in_progress', 'resolved', 'archived'] as FeedbackStatus[]).map((s) => (
            <option key={s} value={s}>
              {FEEDBACK_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        {isUpdating && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden="true" />
          </span>
        )}
      </div>

      {isUpdating && (
        <p className="mt-2 text-xs text-slate-500">更新中...</p>
      )}
    </section>
  )
}
