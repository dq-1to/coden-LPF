import type { FeedbackCategory, FeedbackStatus } from '../../services/feedbackService'

export const CATEGORY_BADGE_CLASSES: Record<FeedbackCategory, string> = {
  bug: 'bg-rose-100 text-rose-700',
  review: 'bg-sky-100 text-sky-700',
  request: 'bg-violet-100 text-violet-700',
  other: 'bg-slate-100 text-slate-700',
}

export const STATUS_BADGE_CLASSES: Record<FeedbackStatus, string> = {
  new: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-sky-100 text-sky-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-slate-100 text-slate-700',
}
