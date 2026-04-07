import { Stethoscope } from 'lucide-react'
import type { CodeDoctorProblem, CodeDoctorProgress } from '../../../content/code-doctor/types'
import { DIFFICULTY_COLOR, DIFFICULTY_LABEL_STANDARD } from '../../../shared/constants'

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
      className="group flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${DIFFICULTY_COLOR[problem.difficulty]}`}
        >
          {DIFFICULTY_LABEL_STANDARD[problem.difficulty]}
        </span>
        {solved ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
            <span aria-hidden="true">✅</span> 解決済み
          </span>
        ) : attempts > 0 ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            {attempts}回挑戦中
          </span>
        ) : null}
      </div>

      <div className="mb-2 flex items-center gap-2">
        <Stethoscope className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
        <p className="font-semibold text-text-dark group-hover:text-amber-700">{problem.title}</p>
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{problem.description}</p>

      <div className="mt-auto pt-3">
        <span className="text-xs font-medium text-amber-600 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100">
          問題を解く →
        </span>
      </div>
    </button>
  )
}
