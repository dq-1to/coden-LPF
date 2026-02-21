import { Link } from 'react-router-dom'
import { COURSES, TOTAL_STEP_COUNT, type CourseMeta, type StepMeta } from '../../../content/courseData'

const LEVEL_LABEL: Record<CourseMeta['level'], string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
}

const LEVEL_COLOR: Record<CourseMeta['level'], string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-sky-100 text-sky-700',
  advanced: 'bg-violet-100 text-violet-700',
}

interface StepRowProps {
  step: StepMeta
  isInProgress: boolean
  isDone: boolean
  isLockedByProgress: boolean
}

function StepRow({ step, isInProgress, isDone, isLockedByProgress }: StepRowProps) {
  const isUnimplemented = !step.isImplemented
  const isLocked = isUnimplemented || isLockedByProgress

  const borderBg = isInProgress
    ? 'border-primary-mint bg-secondary-bg'
    : isDone
      ? 'border-emerald-200 bg-emerald-50/40'
      : 'border-slate-200 bg-slate-50/60'

  const badge = isInProgress
    ? { label: '学習中', cls: 'bg-primary-mint text-white' }
    : isDone
      ? { label: '完了', cls: 'bg-emerald-100 text-emerald-700' }
      : { label: isUnimplemented ? '準備中' : 'ロック中', cls: 'bg-slate-200 text-slate-500' }

  const icon = isLocked ? '🔒' : isDone ? '✅' : isInProgress ? '📖' : '📝'

  const inner = (
    <li className={`rounded-xl border p-4 ${borderBg} ${isLocked ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0 text-base">{icon}</span>
          <div>
            <p className={`font-semibold ${isLocked ? 'text-text-light' : 'text-text-dark'}`}>
              Step {step.order}: {step.title}
            </p>
            <p className="mt-1 text-sm text-text-light">{step.description}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${badge.cls}`}>
          {badge.label}
        </span>
      </div>
    </li>
  )

  if (!isLocked) {
    return <Link to={`/step/${step.id}`}>{inner}</Link>
  }
  return inner
}

interface LearningOverviewCardProps {
  completedCount: number
}

export function LearningOverviewCard({ completedCount }: LearningOverviewCardProps) {
  const progressPercent = Math.max(0, Math.min(100, Math.round((completedCount / TOTAL_STEP_COUNT) * 100)))

  const implementedSteps = COURSES.flatMap((c) => c.steps.filter((s) => s.isImplemented))
  const inProgressStep = completedCount < implementedSteps.length ? implementedSteps[completedCount] : null

  return (
    <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-dark">学習コース進捗</h2>
          <p className="mt-1 text-sm text-text-light">全{TOTAL_STEP_COUNT}ステップのロードマップ</p>
        </div>
        {inProgressStep ? (
          <Link
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            to={`/step/${inProgressStep.id}`}
          >
            続きから再開
          </Link>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="text-primary-dark">
            完了ステップ {completedCount} / {TOTAL_STEP_COUNT}
          </span>
          <span className="text-text-light">{progressPercent}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-primary-mint transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="space-y-6">
        {COURSES.map((course) => {
          const hasSomeImplemented = course.steps.some((s) => s.isImplemented)
          return (
            <div key={course.id}>
              <div className="mb-3 flex items-center gap-2">
                <h3 className={`text-sm font-bold ${hasSomeImplemented ? 'text-text-dark' : 'text-text-light'}`}>
                  {course.title}
                </h3>
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${LEVEL_COLOR[course.level]}`}>
                  {LEVEL_LABEL[course.level]}
                </span>
                {!hasSomeImplemented && (
                  <span className="ml-auto text-xs text-slate-400">準備中</span>
                )}
              </div>
              <ul className="space-y-2">
                {course.steps.map((step) => {
                  const isDone = step.isImplemented && step.order <= completedCount
                  const isInProgress = inProgressStep?.id === step.id
                  const isLockedByProgress = step.isImplemented && step.order > completedCount + 1
                  return (
                    <StepRow
                      key={step.id}
                      step={step}
                      isInProgress={isInProgress}
                      isDone={isDone}
                      isLockedByProgress={isLockedByProgress}
                    />
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
