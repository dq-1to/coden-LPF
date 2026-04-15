import { BookOpenCheck, ChevronRight } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { BaseNookTopic, TopicProgressSummary } from '../../../content/base-nook/types'
import { POINTS_BASE_NOOK_CORRECT } from '../../../shared/constants'

interface TopicCardProps {
  topic: BaseNookTopic
  progress: TopicProgressSummary | undefined
  onClick: () => void
}

export function TopicCard({ topic, progress, onClick }: TopicCardProps) {
  const totalQuestions = topic.questions.length
  const correctCount = progress?.correctCount ?? 0
  const isComplete = correctCount >= totalQuestions
  const earnedPt = correctCount * POINTS_BASE_NOOK_CORRECT

  // アイコンを動的に解決する
  const IconComponent = (Icons as Record<string, Icons.LucideIcon>)[topic.icon] ?? Icons.HelpCircle

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
    >
      {/* ヘッダー: アイコン + 完了バッジ */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
          <IconComponent size={20} aria-hidden="true" />
        </div>
        {isComplete ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
            <BookOpenCheck size={14} aria-hidden="true" />
            全問クリア
          </span>
        ) : correctCount > 0 ? (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
            {correctCount}/{totalQuestions} 正解
          </span>
        ) : null}
      </div>

      {/* タイトル */}
      <h3 className="mb-1 font-semibold text-text-dark group-hover:text-amber-700">
        {topic.title}
      </h3>
      <p className="mb-3 text-sm leading-relaxed text-slate-500">
        {topic.summary}
      </p>

      {/* フッター: 進捗バー + ポイント */}
      <div className="mt-auto pt-2">
        <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-400' : 'bg-amber-400'}`}
            style={{ width: `${totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{earnedPt > 0 ? `${earnedPt} pt` : '--'}</span>
          <span className="flex items-center gap-0.5 font-medium text-amber-600 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100">
            学ぶ <ChevronRight size={14} aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  )
}
