import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, ChevronDown, Code2, FileCode, Puzzle, Stethoscope, Atom, Zap } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ErrorBanner } from '../components/ErrorBanner'
import { CATEGORIES, type CategoryMeta, type CourseMeta } from '../content/courseData'
import { useAuth } from '../contexts/AuthContext'
import { useLearningContext } from '../contexts/LearningContext'
import { AppHeader } from '../features/dashboard/components/AppHeader'
import { getCourseLockStatus, isCourseCompleted } from '../lib/courseLock'
import { supabaseConfigError } from '../lib/supabaseClient'
import { getProfile } from '../services/profileService'
import { getDisplayName } from '../shared/utils/getDisplayName'

const CATEGORY_ICONS: Record<string, typeof Atom> = {
  Atom,
  FileCode,
}

const PRACTICE_CARDS = [
  {
    to: '/daily',
    icon: Zap,
    title: 'デイリーチャレンジ',
    description: '日替わり1問で知識を定着。毎日の習慣に。',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    to: '/practice/code-doctor',
    icon: Stethoscope,
    title: 'コードドクター',
    description: 'バグ入りコードを修正して実践力アップ。',
    color: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  {
    to: '/practice/mini-projects',
    icon: Puzzle,
    title: 'ミニプロジェクト',
    description: '仕様からゼロ実装。段階的に腕を磨く。',
    color: 'text-violet-600 bg-violet-50 border-violet-200',
  },
  {
    to: '/practice/code-reading',
    icon: BookOpen,
    title: 'コードリーディング',
    description: 'コードを読んで理解度を問うクイズ形式。',
    color: 'text-sky-600 bg-sky-50 border-sky-200',
  },
] as const

export function CurriculumPage() {
  useDocumentTitle('カリキュラム')
  const { user, signOut } = useAuth()
  const { completedStepIds, isLoadingStats } = useLearningContext()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const greetingName = useMemo(
    () =>
      getDisplayName(
        user
          ? { ...user, user_metadata: { ...user.user_metadata, display_name: displayName ?? user.user_metadata?.display_name } }
          : null,
      ),
    [displayName, user],
  )

  useEffect(() => {
    if (!user?.id || supabaseConfigError) return
    let isMounted = true
    void getProfile(user.id)
      .then((profile) => {
        if (isMounted) setDisplayName(profile?.display_name ?? null)
      })
      .catch((loadError) => {
        if (isMounted) {
          const message = loadError instanceof Error ? loadError.message : 'プロフィール情報の取得に失敗しました。'
          setError(message)
        }
      })
    return () => { isMounted = false }
  }, [user?.id])

  const handleSignOut = useCallback(async () => {
    const err = await signOut()
    if (err) {
      setError(err)
      return
    }
    navigate('/login', { replace: true })
  }, [signOut, navigate])

  // ハッシュからスクロール
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    const el = document.getElementById(hash)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50">
      <AppHeader displayName={greetingName} onSignOut={() => void handleSignOut()} />

      <main className="mx-auto w-full max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? <ErrorBanner className="mb-4">{error}</ErrorBanner> : null}
        <h1 className="text-2xl font-bold text-slate-900">カリキュラム</h1>
        <p className="mt-1 text-sm text-slate-500">カテゴリ・コース・ステップを一覧して学習を始めましょう</p>

        {/* カテゴリセクション */}
        <div className="mt-8 space-y-10">
          {CATEGORIES.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              completedStepIds={completedStepIds}
              isLoading={isLoadingStats}
            />
          ))}
        </div>

        {/* 練習モードセクション */}
        <section id="practice" className="mt-6 border-t border-slate-200 pt-6">
          <h2 className="text-xl font-bold text-slate-900">練習モード</h2>
          <p className="mt-1 text-sm text-slate-500">繰り返し学習で知識を定着させましょう</p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRACTICE_CARDS.map((card) => (
              <Link
                key={card.to}
                to={card.to}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className={`inline-flex rounded-lg border p-2.5 ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-primary-dark">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">{card.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function CategorySection({
  category,
  completedStepIds,
  isLoading,
}: {
  category: CategoryMeta
  completedStepIds: ReadonlySet<string>
  isLoading: boolean
}) {
  const IconComponent = CATEGORY_ICONS[category.icon] ?? Code2

  return (
    <section id={category.id}>
      <div className="flex items-center gap-3 border-l-4 border-emerald-400 pl-3">
        <div className="rounded-lg bg-primary-mint/10 p-2">
          <IconComponent className="h-5 w-5 text-primary-dark" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{category.title}</h2>
          <p className="text-sm text-slate-500">{category.description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {category.courses.map((course) => (
          <CourseAccordion
            key={course.id}
            course={course}
            completedStepIds={completedStepIds}
            isLoading={isLoading}
          />
        ))}
      </div>
    </section>
  )
}

function CourseAccordion({
  course,
  completedStepIds,
  isLoading,
}: {
  course: CourseMeta
  completedStepIds: ReadonlySet<string>
  isLoading: boolean
}) {
  const lockStatus = getCourseLockStatus(course, completedStepIds)
  const isCompleted = isCourseCompleted(course.id, completedStepIds)
  const implementedSteps = course.steps.filter((s) => s.isImplemented)
  const completedCount = implementedSteps.filter((s) => completedStepIds.has(s.id)).length
  const hasSteps = implementedSteps.length > 0

  // 進行中コースのみ初期展開
  const isInProgress = !isLoading && completedCount > 0 && !isCompleted
  const [isOpen, setIsOpen] = useState(isInProgress)

  useEffect(() => {
    if (!isLoading && completedCount > 0 && !isCompleted) {
      setIsOpen(true)
    }
  }, [isLoading, completedCount, isCompleted])

  const levelLabel = course.level === 'beginner' ? '入門' : course.level === 'intermediate' ? '応用' : '実践'
  const levelColor =
    course.level === 'beginner'
      ? 'bg-emerald-100 text-emerald-700'
      : course.level === 'intermediate'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-purple-100 text-purple-700'

  return (
    <div className={`rounded-xl border bg-white shadow-sm ${lockStatus.locked ? 'border-slate-200 opacity-60' : 'border-slate-200'}`}>
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left sm:px-5 sm:py-4"
        onClick={() => !lockStatus.locked && setIsOpen((prev) => !prev)}
        disabled={lockStatus.locked}
        aria-expanded={isOpen}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${levelColor}`}>
            {levelLabel}
          </span>
          <span className="min-w-0 font-semibold text-slate-900">{course.title}</span>
          {hasSteps && (
            <span className="text-xs text-slate-400">
              {completedCount}/{implementedSteps.length}
            </span>
          )}
          {isCompleted && <span className="text-xs font-semibold text-emerald-600">完了</span>}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {lockStatus.locked && (
            <span className="hidden text-xs text-slate-400 sm:inline">🔒 {lockStatus.reason}</span>
          )}
          {lockStatus.locked && (
            <span className="text-xs text-slate-400 sm:hidden">🔒</span>
          )}
          {!lockStatus.locked && !lockStatus.warning && hasSteps && (
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
          {!lockStatus.locked && lockStatus.warning && (
            <span className="text-xs text-amber-500" title={lockStatus.warning}>⚠️</span>
          )}
        </div>
      </button>

      {isOpen && !lockStatus.locked && hasSteps && (
        <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
          {!lockStatus.locked && lockStatus.warning && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {lockStatus.warning}
            </p>
          )}
          <ul className="space-y-1.5">
            {implementedSteps.map((step) => {
              const done = completedStepIds.has(step.id)
              return (
                <li key={step.id}>
                  <Link
                    to={`/step/${step.id}`}
                    className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-slate-50"
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-emerald-500 text-white' : 'border border-slate-300 text-slate-400'}`}>
                      {done ? '✓' : step.order}
                    </span>
                    <span className={`min-w-0 ${done ? 'text-slate-500' : 'text-slate-800'}`}>{step.title}</span>
                    <span className="ml-auto hidden text-xs text-slate-400 sm:block">{step.description}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {!hasSteps && isOpen && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-400">コンテンツ準備中です</p>
        </div>
      )}
    </div>
  )
}
