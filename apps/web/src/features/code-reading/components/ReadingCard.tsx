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
      className="w-full rounded-xl border border-border bg-bg-surface p-4 text-left transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${DIFFICULTY_COLOR[problem.difficulty]}`}
        >
          {DIFFICULTY_LABEL[problem.difficulty]}
        </span>
        {completed ? (
          <span className="text-sm text-emerald-600">✅ 正答 {correctCount}/{totalCount}</span>
        ) : progress ? (
          <span className="text-xs text-amber-600">🔄 {correctCount}/{totalCount} 正解</span>
        ) : (
          <span className="text-xs text-text-muted">🔓 未挑戦</span>
        )}
      </div>
      <p className="mt-2 font-semibold text-text-dark">{problem.title}</p>
      <p className="mt-1 line-clamp-2 text-xs text-text-muted">{problem.description}</p>
      <p className="mt-2 text-xs text-text-muted">設問: {totalCount}問</p>
    </button>
  )
}
