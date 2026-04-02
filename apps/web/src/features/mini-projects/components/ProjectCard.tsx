import { FolderOpen } from 'lucide-react'
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
      className="group flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${DIFFICULTY_COLOR[project.difficulty]}`}
        >
          {DIFFICULTY_LABEL[project.difficulty]}
        </span>
        {status === 'completed' ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
            ✅ 完了
          </span>
        ) : status === 'in_progress' ? (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
            🔄 進行中
          </span>
        ) : null}
      </div>

      <div className="mb-2 flex items-center gap-2">
        <FolderOpen className="h-4 w-4 shrink-0 text-violet-400" />
        <p className="font-semibold text-text-dark group-hover:text-amber-700">{project.title}</p>
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{project.description}</p>

      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        {project.keyElements.map((el) => (
          <span
            key={el}
            className="rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-xs text-slate-500"
          >
            {el}
          </span>
        ))}
      </div>
    </button>
  )
}
