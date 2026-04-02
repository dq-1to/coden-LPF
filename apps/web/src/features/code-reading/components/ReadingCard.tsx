import { BookOpen } from 'lucide-react'
import type { CodeReadingProblem, CodeReadingDifficulty, CodeReadingProgress } from '../../../content/code-reading/types'

const DIFFICULTY_LABEL: Record<CodeReadingDifficulty, string> = {
  basic: '基礎',
  intermediate: '応用',
  advanced: '実践',
}

const DIFFICULTY_COLOR: Record<CodeReadingDifficulty, string> = {
  basic: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
  advanced: 'text-rose-700 bg-rose-50 border-rose-200',
}

interface ReadingCardProps {
  problem: CodeReadingProblem
  progress: CodeReadingProgress | undefined
  onClick: () => void
}

export function ReadingCard({ problem, progress, onClick }: ReadingCardProps) {
  const completed = progress?.completed ?? false
  const correctCount = progress?.correctCount ?? 0
  const totalCount = problem.questions.length

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${DIFFICULTY_COLOR[problem.difficulty]}`}
        >
          {DIFFICULTY_LABEL[problem.difficulty]}
        </span>
        {completed ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
            ✅ {correctCount}/{totalCount}
          </span>
        ) : progress ? (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
            🔄 {correctCount}/{totalCount} 正解
          </span>
        ) : null}
      </div>

      <div className="mb-2 flex items-center gap-2">
        <BookOpen className="h-4 w-4 shrink-0 text-sky-400" />
        <p className="font-semibold text-text-dark group-hover:text-amber-700">{problem.title}</p>
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{problem.description}</p>

      <div className="mt-auto flex items-center justify-between pt-3">
        <span className="rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-xs text-slate-500">
          設問 {totalCount}問
        </span>
        <span className="text-xs font-medium text-amber-600 opacity-0 transition-opacity group-hover:opacity-100">
          挑戦する →
        </span>
      </div>
    </button>
  )
}
