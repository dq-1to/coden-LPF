import type { MiniProject, MiniProjectDifficulty, MiniProjectProgress } from '../../../content/mini-projects/types'

const DIFFICULTY_LABEL: Record<MiniProjectDifficulty, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
}

const DIFFICULTY_COLOR: Record<MiniProjectDifficulty, string> = {
  beginner: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
  advanced: 'text-rose-700 bg-rose-50 border-rose-200',
}

interface ProjectCardProps {
  project: MiniProject
  progress: MiniProjectProgress | undefined
  onClick: () => void
}

export function ProjectCard({ project, progress, onClick }: ProjectCardProps) {
  const status = progress?.status ?? 'not_started'

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-border bg-bg-surface p-4 text-left transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${DIFFICULTY_COLOR[project.difficulty]}`}
        >
          {DIFFICULTY_LABEL[project.difficulty]}
        </span>
        {status === 'completed' ? (
          <span className="text-sm text-emerald-600">✅ 完了</span>
        ) : status === 'in_progress' ? (
          <span className="text-xs text-amber-600">🔄 進行中</span>
        ) : (
          <span className="text-xs text-text-muted">🔓 未着手</span>
        )}
      </div>
      <p className="mt-2 font-semibold text-text-dark">{project.title}</p>
      <p className="mt-1 line-clamp-2 text-xs text-text-muted">{project.description}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {project.keyElements.map((el) => (
          <span
            key={el}
            className="rounded-md bg-bg-muted px-1.5 py-0.5 text-xs text-text-muted"
          >
            {el}
          </span>
        ))}
      </div>
    </button>
  )
}
