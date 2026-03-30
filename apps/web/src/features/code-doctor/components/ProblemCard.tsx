import type { CodeDoctorProblem, CodeDoctorProgress } from '../../../content/code-doctor/types'

const DIFFICULTY_LABEL: Record<CodeDoctorProblem['difficulty'], string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
}

const DIFFICULTY_COLOR: Record<CodeDoctorProblem['difficulty'], string> = {
  beginner: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
  advanced: 'text-rose-700 bg-rose-50 border-rose-200',
}

interface ProblemCardProps {
  problem: CodeDoctorProblem
  progress: CodeDoctorProgress | undefined
  onClick: () => void
}

export function ProblemCard({ problem, progress, onClick }: ProblemCardProps) {
  const solved = progress?.solved ?? false
  const attempts = progress?.attempts ?? 0

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
        {solved ? (
          <span className="text-sm text-emerald-600">✅ 解決済み</span>
        ) : attempts > 0 ? (
          <span className="text-xs text-text-muted">{attempts}回挑戦中</span>
        ) : (
          <span className="text-xs text-text-muted">🔓 未挑戦</span>
        )}
      </div>
      <p className="mt-2 font-semibold text-text-dark">{problem.title}</p>
      <p className="mt-1 line-clamp-2 text-xs text-text-muted">{problem.description}</p>
    </button>
  )
}
