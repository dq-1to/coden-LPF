import { FormEvent, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Button } from '../components/Button'
import { ConfigErrorView } from '../components/ConfigErrorView'
import { ErrorBanner } from '../components/ErrorBanner'
import { useAuth } from '../contexts/AuthContext'
import { supabaseConfigError } from '../lib/supabaseClient'

const MIN_PASSWORD_LENGTH = 8
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateSignUpForm(email: string, password: string): string | null {
  if (!EMAIL_PATTERN.test(email)) {
    return '正しいメールアドレスを入力してください。'
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください。`
  }

  return null
}

export function SignUpPage() {
  const { signUp, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmEmail, setShowConfirmEmail] = useState(false)

  const isDisabled = useMemo(() => isSubmitting || Boolean(supabaseConfigError), [isSubmitting])

  useDocumentTitle('アカウント作成')

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedEmail = email.trim()
    const validationError = validateSignUpForm(normalizedEmail, password)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsSubmitting(true)

    const message = await signUp(normalizedEmail, password)
    if (message === 'CONFIRM_EMAIL') {
      setShowConfirmEmail(true)
      setIsSubmitting(false)
      return
    }
    if (message) {
      setError(message)
      setIsSubmitting(false)
      return
    }

    navigate('/', { replace: true })
  }

  if (showConfirmEmail) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50 px-6 py-16">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <h2 className="text-xl font-bold text-slate-800">メールアドレスを確認してください</h2>
          <p className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">{email}</span> に確認メールを送信しました。
          </p>
          <p className="text-sm text-slate-600">メール内のリンクをクリックして、アカウントの作成を完了してください。</p>
          <Link className="inline-block text-sm font-medium text-primary-dark underline" to="/login">
            ログインページへ
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50 px-6 py-16">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <img src="/coden_logo.png" alt="Coden Logo" className="h-12 w-12 object-contain" />
          <h1 className="font-display text-3xl font-bold tracking-tight text-primary-mint">Coden</h1>
        </div>
        <p className="text-slate-600">新規アカウントを作成して、React学習を始めましょう。</p>
      </header>

      {supabaseConfigError ? <ConfigErrorView message={supabaseConfigError} /> : null}

      <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit} noValidate>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">メールアドレス</span>
          <input
            aria-label="メールアドレス"
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
            aria-label="パスワード"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-mint/30 focus:border-primary-mint"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
          <span className="mt-1 block text-xs text-slate-500">{MIN_PASSWORD_LENGTH}文字以上で入力してください。</span>
        </label>

        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <Button type="submit" fullWidth disabled={isDisabled}>
          {isSubmitting ? '登録中...' : 'アカウントを作成'}
        </Button>

        <p className="text-center text-sm text-slate-600">
          すでにアカウントをお持ちですか？{' '}
          <Link className="font-medium text-primary-dark underline" to="/login">
            ログインはこちら
          </Link>
        </p>
      </form>
    </main>
  )
}
