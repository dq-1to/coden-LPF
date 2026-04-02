import { type FormEvent, useMemo, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Button } from '../components/Button'
import { ConfigErrorView } from '../components/ConfigErrorView'
import { ErrorBanner } from '../components/ErrorBanner'
import { useAuth } from '../contexts/AuthContext'
import { supabaseConfigError } from '../lib/supabaseClient'

export function LoginPage() {
  const { signIn, user } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from ?? '/'
  }, [location.state])

  useDocumentTitle('ログイン')

  if (user) {
    return <Navigate to={redirectPath} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const message = await signIn(email.trim(), password)

    if (message) {
      setError(message)
    }

    setIsSubmitting(false)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50 px-6 py-16">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <img src="/coden_logo.png" alt="Coden Logo" className="h-12 w-12 object-contain" />
          <h1 className="font-display text-3xl font-bold tracking-tight text-primary-mint">Coden</h1>
        </div>
        <p className="text-slate-600">メールアドレスとパスワードでログインしてください。</p>
      </header>

      {supabaseConfigError ? <ConfigErrorView message={supabaseConfigError} /> : null}

      <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">メールアドレス</span>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-mint/30 focus:border-primary-mint"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">パスワード</span>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-mint/30 focus:border-primary-mint"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <Button type="submit" fullWidth disabled={isSubmitting || Boolean(supabaseConfigError)}>
          {isSubmitting ? 'ログイン中...' : 'ログイン'}
        </Button>

        <p className="text-center text-sm text-slate-600">
          はじめて利用しますか？{' '}
          <Link className="font-medium text-primary-dark underline" to="/signup">
            アカウントを作成
          </Link>
        </p>
      </form>
    </main>
  )
}
