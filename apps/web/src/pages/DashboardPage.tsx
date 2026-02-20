import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ConfigErrorView } from '../components/ConfigErrorView'
import { useAuth } from '../contexts/AuthContext'
import { AppHeader } from '../features/dashboard/components/AppHeader'
import { DashboardSidebar } from '../features/dashboard/components/DashboardSidebar'
import { LearningOverviewCard } from '../features/dashboard/components/LearningOverviewCard'
import { WelcomeBanner } from '../features/dashboard/components/WelcomeBanner'
import { supabase, supabaseConfigError } from '../lib/supabaseClient'
import { getCompletedStepCount } from '../services/progressService'

const TOTAL_STEPS = 4

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const userId = user?.id ?? null
  const [completedCount, setCompletedCount] = useState(0)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const greetingName = useMemo(() => {
    if (displayName) {
      return displayName
    }

    if (user?.email) {
      return user.email.split('@')[0]
    }

    return 'ゲスト'
  }, [displayName, user?.email])

  useEffect(() => {
    if (!userId || supabaseConfigError) {
      return
    }
    const currentUserId = userId

    let isMounted = true

    async function loadDashboard() {
      try {
        const [count, profileResult] = await Promise.all([
          getCompletedStepCount(currentUserId),
          supabase.from('profiles').select('display_name').eq('id', currentUserId).maybeSingle(),
        ])

        if (!isMounted) {
          return
        }

        setCompletedCount(count)

        if (!profileResult.error) {
          setDisplayName(profileResult.data?.display_name ?? null)
        }
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
        {error ? <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="space-y-6 lg:col-span-8">
            <WelcomeBanner displayName={greetingName} />
            <LearningOverviewCard completedCount={completedCount} totalSteps={TOTAL_STEPS} />
            <Link className="inline-flex text-sm font-semibold text-primary-dark underline" to="/step/usestate-basic">
              学習画面へ移動（/step/usestate-basic）
            </Link>
          </section>

          <section className="lg:col-span-4">
            <DashboardSidebar />
          </section>
        </div>
      </main>
    </div>
  )
}
