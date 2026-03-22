import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ConfigErrorView } from '../components/ConfigErrorView'
import { ErrorBanner } from '../components/ErrorBanner'
import { getFirstImplementedStep, IMPLEMENTED_STEP_COUNT } from '../content/courseData'
import { useAuth } from '../contexts/AuthContext'
import { useLearningContext } from '../contexts/LearningContext'
import { AppHeader } from '../features/dashboard/components/AppHeader'
import { DashboardSidebar } from '../features/dashboard/components/DashboardSidebar'
import { LearningOverviewCard } from '../features/dashboard/components/LearningOverviewCard'
import { ReviewListWidget } from '../features/dashboard/components/ReviewListWidget'
import { WelcomeBanner } from '../features/dashboard/components/WelcomeBanner'
import { supabaseConfigError } from '../lib/supabaseClient'
import { getProfile } from '../services/profileService'
import { getDisplayName } from '../shared/utils/getDisplayName'

export function DashboardPage() {
  useDocumentTitle('ダッシュボード')
  const { user, signOut } = useAuth()
  const { completedStepsCount } = useLearningContext()
  const navigate = useNavigate()
  const userId = user?.id ?? null
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const firstImplementedStep = getFirstImplementedStep()

  const greetingName = useMemo(
    () =>
      getDisplayName(
        user
          ? {
              ...user,
              user_metadata: {
                ...user.user_metadata,
                display_name: displayName ?? user.user_metadata?.display_name,
              },
            }
          : null,
      ),
    [displayName, user],
  )

  useEffect(() => {
    if (!userId || supabaseConfigError) {
      return
    }
    const currentUserId = userId

    let isMounted = true

    async function loadDashboard() {
      try {
        const profile = await getProfile(currentUserId)

        if (!isMounted) {
          return
        }

        setDisplayName(profile?.display_name ?? null)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        const message = loadError instanceof Error ? loadError.message : 'ダッシュボードの取得に失敗しました。'
        setError(message)
      }
    }

    void loadDashboard()

    return () => {
      isMounted = false
    }
  }, [userId])

  async function handleSignOut() {
    const signOutError = await signOut()

    if (signOutError) {
      setError(signOutError)
      return
    }

    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50">
      <AppHeader displayName={greetingName} onSignOut={() => void handleSignOut()} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
            <LearningOverviewCard completedCount={Math.min(completedStepsCount, IMPLEMENTED_STEP_COUNT)} />
            <ReviewListWidget />
          </section>

          <section className="lg:col-span-4">
            <DashboardSidebar />
          </section>
        </div>
      </main>
    </div>
  )
}
