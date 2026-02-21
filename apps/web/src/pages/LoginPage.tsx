import { FormEvent, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ConfigErrorView } from '../components/ConfigErrorView'
import { useAuth } from '../contexts/AuthContext'
import { supabaseConfigError } from '../lib/supabaseClient'

export function LoginPage() {
  const { signIn, user } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('test01@coden.dev')
  const [password, setPassword] = useState('TestPass123!')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from ?? '/'
  }, [location.state])

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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <img src="/coden_logo.png" alt="Coden Logo" className="h-12 w-12 object-contain" />
          <h1 className="font-display text-3xl font-bold tracking-tight text-primary-mint">Coden MVP</h1>
        </div>
        <p className="text-slate-600">メールアドレスとパスワードでログインしてください。</p>
      </header>

      {supabaseConfigError ? <ConfigErrorView message={supabaseConfigError} /> : null}

      <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">メールアドレス</span>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
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
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting || Boolean(supabaseConfigError)}
        >
          {isSubmitting ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
    </main>
  )
}
