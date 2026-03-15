import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
            <LearningOverviewCard completedCount={Math.min(completedStepsCount, IMPLEMENTED_STEP_COUNT)} />
            <ReviewListWidget />
            {firstImplementedStep ? (
              <Link className="inline-flex text-sm font-semibold text-primary-dark underline" to={`/step/${firstImplementedStep.id}`}>
                最初のレッスンから始める
              </Link>
            ) : null}
          </section>

          <section className="lg:col-span-4">
            <DashboardSidebar />
          </section>
        </div>
      </main>
    </div>
  )
}
