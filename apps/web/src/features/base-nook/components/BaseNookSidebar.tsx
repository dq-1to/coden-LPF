import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Check, Minus } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { BaseNookTopic, TopicProgressSummary } from '../../../content/base-nook/types'

interface BaseNookSidebarProps {
  topics: BaseNookTopic[]
  progressMap: Map<string, TopicProgressSummary>
}

export function BaseNookSidebar({ topics, progressMap }: BaseNookSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const listContent = (
    <ul className="space-y-0.5">
      {topics.map((topic) => {
        const progress = progressMap.get(topic.id)
        const total = topic.questions.length
        const correct = progress?.correctCount ?? 0
        const isComplete = correct >= total

        const IconComponent = (Icons as Record<string, Icons.LucideIcon>)[topic.icon] ?? Icons.HelpCircle

        return (
          <li key={topic.id}>
            <Link
              to={`/base-nook/${topic.id}`}
              className="flex min-h-[44px] items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-sky-50 hover:text-sky-700"
            >
              <IconComponent size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-text-dark">{topic.title}</span>
              {isComplete ? (
                <Check size={14} className="shrink-0 text-emerald-500" aria-hidden="true" />
              ) : correct > 0 ? (
                <Minus size={14} className="shrink-0 text-amber-500" aria-hidden="true" />
              ) : null}
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <>
      {/* デスクトップ: 固定サイドバー */}
      <aside className="hidden w-56 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-light">
          目次
        </p>
        {listContent}
      </aside>

      {/* モバイル: 折りたたみトグル */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex w-full min-h-[44px] items-center justify-between px-4 py-3 text-sm font-medium text-text-dark"
          aria-expanded={isOpen}
        >
          {isOpen ? '目次を閉じる' : '目次を見る'}
          {isOpen ? (
            <ChevronUp size={16} className="text-slate-400" aria-hidden="true" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" aria-hidden="true" />
          )}
        </button>
        <div
          className="overflow-hidden transition-[max-height,opacity] duration-300"
          style={{ maxHeight: isOpen ? `${topics.length * 44 + 16}px` : '0px', opacity: isOpen ? 1 : 0 }}
        >
          <div className="px-3 pb-3">
            {listContent}
          </div>
        </div>
      </div>
    </>
  )
}
