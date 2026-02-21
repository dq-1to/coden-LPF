import { Link } from 'react-router-dom'
import type { LearningStepContent } from '../content/fundamentals/steps'
import { useLearningContext } from '../contexts/LearningContext'

interface LearningSidebarProps {
  currentStepId: string
  steps: LearningStepContent[]
}

export function LearningSidebar({ currentStepId, steps }: LearningSidebarProps) {
  const { completedStepsCount, isLoadingStats } = useLearningContext()

  return (
    <aside className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:w-72">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">React基礎コース</p>
      <ul className="mt-3 space-y-2">
        {steps.map((step) => {
          const isCurrent = step.id === currentStepId
          const isLocked = !isLoadingStats && step.order > completedStepsCount + 1

          const content = (
            <>
              <p className="text-xs text-slate-500">
                STEP {step.order} {isLocked ? '🔒' : ''}
              </p>
              <p className="font-medium">{step.title}</p>
            </>
          )

          const baseClass = `block rounded-lg border px-3 py-2 text-sm transition`

          if (isLocked) {
            return (
              <li key={step.id}>
                <div className={`${baseClass} border-slate-200 bg-slate-50 text-slate-400 opacity-60`}>
                  {content}
                </div>
              </li>
            )
          }

          return (
            <li key={step.id}>
              <Link
                className={`${baseClass} ${isCurrent
                  ? 'border-blue-300 bg-blue-50 text-blue-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                to={`/step/${step.id}`}
                replace
              >
                {content}
              </Link>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
