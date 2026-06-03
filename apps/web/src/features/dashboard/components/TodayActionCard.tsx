import { ArrowRight, CheckCircle2, RotateCcw, Sparkles, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RecommendedAction, RecommendedActionType } from '../../../services/recommendationService'

interface TodayActionCardProps {
  action: RecommendedAction
}

const ACTION_META: Record<RecommendedActionType, { label: string; icon: typeof Target }> = {
  review: { label: '復習', icon: RotateCcw },
  resume: { label: '再開', icon: Target },
  start: { label: '開始', icon: Sparkles },
  next: { label: '次のステップ', icon: ArrowRight },
  complete: { label: '完了後の練習', icon: CheckCircle2 },
}

export function TodayActionCard({ action }: TodayActionCardProps) {
  const meta = ACTION_META[action.type]
  const Icon = meta.icon

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="today-action-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-mint/10 px-3 py-1 text-xs font-bold text-primary-dark">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              今日のおすすめ
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {meta.label}
            </span>
          </div>
          <h2 id="today-action-title" className="mt-3 text-xl font-black leading-snug text-slate-950 sm:text-2xl">
            {action.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {action.description}
          </p>
        </div>

        <Link
          to={action.to}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-mint px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-mint/30 sm:text-base"
        >
          {action.ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
