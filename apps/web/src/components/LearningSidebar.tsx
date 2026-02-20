import { Link } from 'react-router-dom'
import type { LearningStepContent } from '../content/fundamentals/steps'

interface LearningSidebarProps {
  currentStepId: string
  steps: LearningStepContent[]
}

export function LearningSidebar({ currentStepId, steps }: LearningSidebarProps) {
  return (
    <aside className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:w-72">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">React基礎コース</p>
      <ul className="mt-3 space-y-2">
        {steps.map((step) => {
          const isCurrent = step.id === currentStepId

          return (
            <li key={step.id}>
              <Link
                className={`block rounded-lg border px-3 py-2 text-sm transition ${
                  isCurrent
                    ? 'border-blue-300 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
                to={`/step/${step.id}`}
              >
                <p className="text-xs text-slate-500">STEP {step.order}</p>
                <p className="font-medium">{step.title}</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
