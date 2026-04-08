import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown, Lock } from 'lucide-react'
import type { CategoryMeta, CourseMeta } from '../content/courseData'
import { useLearningContext } from '../contexts/LearningContext'
import { getCourseLockStatus } from '../lib/courseLock'

interface LearningSidebarProps {
  category: CategoryMeta | undefined
  currentStepId: string
}

export function LearningSidebar({ category, currentStepId }: LearningSidebarProps) {
  const { completedStepIds } = useLearningContext()
  const [isCollapsed, setIsCollapsed] = useState(true)

  if (!category) return null

  return (
    <aside className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:w-72" aria-label="学習コースナビゲーション">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{category.title}</p>
        <button
          className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
          type="button"
          aria-expanded={!isCollapsed}
          aria-controls="learning-sidebar-list"
          onClick={() => setIsCollapsed((current) => !current)}
        >
          {isCollapsed ? 'コース一覧を見る' : 'コース一覧を隠す'}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      <div
        id="learning-sidebar-list"
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out lg:max-h-none lg:overflow-visible ${isCollapsed ? 'max-h-0 opacity-0 lg:opacity-100' : 'mt-3 max-h-[80vh] opacity-100'}`}
      >
        <div className="space-y-3 pt-3 lg:pt-0">
          {category.courses.map((course) => (
            <CourseSection
              key={course.id}
              course={course}
              currentStepId={currentStepId}
              completedStepIds={completedStepIds}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}

function CourseSection({
  course,
  currentStepId,
  completedStepIds,
}: {
  course: CourseMeta
  currentStepId: string
  completedStepIds: ReadonlySet<string>
}) {
  const containsCurrent = course.steps.some((s) => s.id === currentStepId)
  const [isOpen, setIsOpen] = useState(containsCurrent)
  const lockStatus = getCourseLockStatus(course, completedStepIds)
  const implementedSteps = course.steps.filter((s) => s.isImplemented)

  if (implementedSteps.length === 0) return null

  return (
    <div>
      <button
        type="button"
        className={`flex w-full min-h-[44px] items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
          containsCurrent ? 'text-primary-dark' : 'text-slate-600 hover:bg-slate-50'
        } ${lockStatus.locked ? 'opacity-50' : ''}`}
        onClick={() => !lockStatus.locked && setIsOpen((prev) => !prev)}
        disabled={lockStatus.locked}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-1.5">
          {lockStatus.locked && <Lock className="h-3 w-3 text-slate-400" aria-hidden="true" />}
          {course.title}
        </span>
        {!lockStatus.locked && (
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        )}
      </button>

      {isOpen && !lockStatus.locked && (
        <ul className="mt-1 space-y-1 pl-1" aria-label={course.title}>
          {implementedSteps.map((step) => {
            const isCurrent = step.id === currentStepId
            const isDone = completedStepIds.has(step.id)

            return (
              <li key={step.id}>
                <Link
                  className={`flex min-h-[44px] items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition ${
                    isCurrent
                      ? 'border border-primary-mint/30 bg-secondary-bg text-primary-dark'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  to={`/step/${step.id}`}
                  replace
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    isDone ? 'bg-emerald-500 text-white' : 'border border-slate-300 text-slate-400'
                  }`}>
                    {isDone ? <Check className="h-2.5 w-2.5" aria-hidden="true" /> : step.order}
                  </span>
                  <span className="truncate">{step.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
