import { type FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthBrandHeader } from '../components/AuthBrandHeader'
import { Button } from '../components/Button'
import { ConfigErrorView } from '../components/ConfigErrorView'
import { ErrorBanner } from '../components/ErrorBanner'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { supabaseConfigError } from '../lib/supabaseClient'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getResetRedirectUrl() {
  return `${window.location.origin}/reset-password`
}

function validateEmail(email: string): string | null {
  if (!EMAIL_PATTERN.test(email)) {
    return '正しいメールアドレスを入力してください。'
  }

  return null
}

export function ForgotPasswordPage() {
  const { sendPasswordResetEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const isDisabled = useMemo(() => isSubmitting || Boolean(supabaseConfigError), [isSubmitting])

  useDocumentTitle('パスワードリセット')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedEmail = email.trim()
    const validationError = validateEmail(normalizedEmail)
    if (validationError) {
      setError(validationError)
      setIsSent(false)
      return
    }

    setError(null)
    setIsSubmitting(true)

    const message = await sendPasswordResetEmail(normalizedEmail, getResetRedirectUrl())
    if (message) {
      setError(message)
      setIsSent(false)
      setIsSubmitting(false)
      return
    }

    setIsSent(true)
    setIsSubmitting(false)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50 px-4 py-8 sm:px-6 sm:py-16">
      <AuthBrandHeader subtitle="登録メールアドレスにパスワード再設定リンクを送信します。" />

      {supabaseConfigError ? <ConfigErrorView message={supabaseConfigError} /> : null}

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
        noValidate
        aria-label="パスワードリセット依頼フォーム"
      >
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}
        {isSent ? (
          <ErrorBanner variant="success">
            リセットメールを送信しました。メール内のリンクから新しいパスワードを設定してください。
          </ErrorBanner>
        ) : null}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">メールアドレス</span>
          <input
            aria-label="メールアドレス"
            className="min-h-[44px] w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-primary-mint focus:ring-2 focus:ring-primary-mint/30"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <Button type="submit" fullWidth disabled={isDisabled}>
          {isSubmitting ? '送信中...' : 'リセットメールを送信'}
        </Button>

        <p className="text-center text-sm text-slate-600">
          パスワードを思い出しましたか？{' '}
          <Link className="font-medium text-primary-dark underline" to="/login">
            ログインへ戻る
          </Link>
        </p>
      </form>
    </main>
  )
}
