import { type FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthBrandHeader } from '../components/AuthBrandHeader'
import { Button } from '../components/Button'
import { ConfigErrorView } from '../components/ConfigErrorView'
import { ErrorBanner } from '../components/ErrorBanner'
import { PageSpinner } from '../components/Spinner'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { supabaseConfigError } from '../lib/supabaseClient'

const MIN_PASSWORD_LENGTH = 8

function getRecoveryErrorMessage() {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const queryParams = new URLSearchParams(window.location.search)
  const errorDescription = hashParams.get('error_description') ?? queryParams.get('error_description')

  if (errorDescription) {
    return decodeURIComponent(errorDescription)
  }

  return 'リンクが無効または期限切れです。もう一度リセットメールを送信してください。'
}

function validatePassword(password: string, confirmPassword: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください。`
  }

  if (password !== confirmPassword) {
    return '確認用パスワードが一致しません。'
  }

  return null
}

export function ResetPasswordPage() {
  const { isLoadingAuth, session, updatePassword, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)

  const isDisabled = useMemo(() => isSubmitting || Boolean(supabaseConfigError), [isSubmitting])

  useDocumentTitle('新しいパスワード設定')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationError = validatePassword(password, confirmPassword)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsSubmitting(true)

    const message = await updatePassword(password)
    if (message) {
      setError(message)
      setIsSubmitting(false)
      return
    }

    await signOut()
    setPassword('')
    setConfirmPassword('')
    setIsUpdated(true)
    setIsSubmitting(false)
  }

  if (isLoadingAuth) {
    return <PageSpinner />
  }

  if (isUpdated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50 px-4 py-8 sm:px-6 sm:py-16">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">パスワードを更新しました</h1>
          <p className="text-sm text-slate-600">新しいパスワードでログインしてください。</p>
          <Link className="inline-block text-sm font-medium text-primary-dark underline" to="/login">
            ログインへ進む
          </Link>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50 px-4 py-8 sm:px-6 sm:py-16">
        <AuthBrandHeader subtitle="パスワード再設定リンクを確認できませんでした。" />
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ErrorBanner>{getRecoveryErrorMessage()}</ErrorBanner>
          <Link className="inline-block text-sm font-medium text-primary-dark underline" to="/forgot-password">
            リセットメールを再送信する
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50 px-4 py-8 sm:px-6 sm:py-16">
      <AuthBrandHeader subtitle="新しいパスワードを設定してください。" />

      {supabaseConfigError ? <ConfigErrorView message={supabaseConfigError} /> : null}

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
        noValidate
        aria-label="新しいパスワード設定フォーム"
      >
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">新しいパスワード</span>
          <input
            aria-label="新しいパスワード"
            className="min-h-[44px] w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-primary-mint focus:ring-2 focus:ring-primary-mint/30"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
          <span className="mt-1 block text-xs text-slate-500">{MIN_PASSWORD_LENGTH}文字以上で入力してください。</span>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">新しいパスワード（確認）</span>
          <input
            aria-label="新しいパスワード（確認）"
            className="min-h-[44px] w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-primary-mint focus:ring-2 focus:ring-primary-mint/30"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </label>

        <Button type="submit" fullWidth disabled={isDisabled}>
          {isSubmitting ? '更新中...' : 'パスワードを更新'}
        </Button>
      </form>
    </main>
  )
}
