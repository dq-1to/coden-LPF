import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ConfigErrorView } from '../components/ConfigErrorView'
import { useAuth } from '../contexts/AuthContext'
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
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">ダッシュボード</h1>
          <p className="text-slate-600">こんにちは、{greetingName}さん</p>
        </div>
        <button
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          type="button"
          onClick={handleSignOut}
        >
          ログアウト
        </button>
      </header>

      {supabaseConfigError ? <ConfigErrorView message={supabaseConfigError} /> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">学習中コース</p>
          <p className="mt-2 text-xl font-semibold">React基礎</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">完了ステップ</p>
          <p className="mt-2 text-xl font-semibold">
            {completedCount} / {TOTAL_STEPS}
          </p>
        </article>
      </section>

      <Link className="text-sm font-medium text-blue-700 underline" to="/step/usestate-basic">
        学習画面へ（/step/usestate-basic）
      </Link>
    </main>
  )
}
