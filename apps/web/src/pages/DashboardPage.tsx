import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Atom, BookOpen, Zap } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useGreetingName } from '../hooks/useGreetingName'
import { useSignOut } from '../hooks/useSignOut'
import { ConfigErrorView } from '../components/ConfigErrorView'
import { ErrorBanner } from '../components/ErrorBanner'
import { CATEGORIES, type CategoryMeta, getFirstImplementedStep } from '../content/courseData'
import { useLearningContext } from '../contexts/LearningContext'
import { AppHeader } from '../features/dashboard/components/AppHeader'
import { DashboardSidebar } from '../features/dashboard/components/DashboardSidebar'
import { WelcomeBanner } from '../features/dashboard/components/WelcomeBanner'
import { isCourseCompleted } from '../lib/courseLock'
import { supabaseConfigError } from '../lib/supabaseClient'
import { CATEGORY_ICONS, PRACTICE_MODE_CARDS } from '../shared/constants'

export function DashboardPage() {
  useDocumentTitle('ダッシュボード')
  const { completedStepIds, completedStepsCount } = useLearningContext()
  const { greetingName } = useGreetingName()
  const [error, setError] = useState<string | null>(null)
  const onSignOutError = useCallback((msg: string) => setError(msg), [])
  const handleSignOut = useSignOut(onSignOutError)
  const firstImplementedStep = getFirstImplementedStep()

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50">
      <AppHeader displayName={greetingName} onSignOut={() => void handleSignOut()} />

      <main className="mx-auto w-full max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
        {supabaseConfigError ? <ConfigErrorView message={supabaseConfigError} /> : null}
        {error ? <ErrorBanner className="mb-4">{error}</ErrorBanner> : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="space-y-6 lg:col-span-8">
            <WelcomeBanner displayName={greetingName} />

            {completedStepsCount === 0 && firstImplementedStep ? (
              <div className="rounded-2xl border border-primary-mint/30 bg-gradient-to-r from-primary-mint/10 via-white to-primary-mint/5 p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-600">はじめての方へ</p>
                <p className="mt-1 text-lg font-bold text-slate-900">React学習を始めましょう</p>
                <Link
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-mint px-6 py-3 text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark active:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-primary-mint/30"
                  to={`/step/${firstImplementedStep.id}`}
                >
                  最初のレッスンから始める →
                </Link>
              </div>
            ) : null}

            {/* カテゴリカード群 */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">学習コース</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {CATEGORIES.map((cat) => (
                  <CategoryCard key={cat.id} category={cat} completedStepIds={completedStepIds} />
                ))}
              </div>
            </div>

            {/* ベースヌック & デイリーチャレンジ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link
                to="/base-nook"
                className="block rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50/50 p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-sky-100 p-2.5">
                    <BookOpen className="h-5 w-5 text-sky-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">ベースヌック</h3>
                    <p className="text-sm text-slate-500">コードの「なぜ？」がわかる基礎知識</p>
                  </div>
                </div>
              </Link>
              <Link
                to="/daily"
                className="block rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/50 p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-100 p-2.5">
                    <Zap className="h-5 w-5 text-amber-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">デイリーチャレンジ</h3>
                    <p className="text-sm text-slate-500">今日の1問に挑戦して知識を定着させましょう</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* スキルアップセクション */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">スキルアップ</h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
                {PRACTICE_MODE_CARDS.filter((c) => c.to !== '/daily').map((card) => (
                  <Link
                    key={card.to}
                    to={card.to}
                    className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className={`inline-flex rounded-lg border p-2 ${card.color}`}>
                      <card.icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-primary-dark">
                      {card.title}
                    </h3>
                    <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">{card.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="lg:col-span-4">
            <DashboardSidebar />
          </section>
        </div>
      </main>
    </div>
  )
}

function CategoryCard({
  category,
  completedStepIds,
}: {
  category: CategoryMeta
  completedStepIds: ReadonlySet<string>
}) {
  const IconComponent = CATEGORY_ICONS[category.icon] ?? Atom
  const implementedSteps = category.courses.flatMap((c) => c.steps.filter((s) => s.isImplemented))
  const completedCount = implementedSteps.filter((s) => completedStepIds.has(s.id)).length
  const totalCount = implementedSteps.length
  const completedCourses = category.courses.filter((c) => isCourseCompleted(c.id, completedStepIds)).length
  const totalCourses = category.courses.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Link
      to={`/curriculum#${category.id}`}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary-mint/10 p-2.5">
          <IconComponent className="h-5 w-5 text-primary-dark" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 group-hover:text-primary-dark">{category.title}</h3>
          <p className="text-xs text-slate-500">
            {totalCourses}コース · {completedCourses}完了
          </p>
        </div>
      </div>
      {totalCount > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">
              {completedCount}/{totalCount} ステップ
            </span>
            <span className="text-slate-400" aria-live="polite">{progressPercent}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100 sm:h-1.5">
            <div
              className="h-full rounded-full bg-primary-mint transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
      {totalCount === 0 && (
        <p className="mt-3 text-xs text-slate-400">コンテンツ準備中</p>
      )}
    </Link>
  )
}
