import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function StepPage() {
  const { stepId } = useParams()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">学習画面</h1>
          <p className="text-slate-600">stepId: {stepId}</p>
        </div>
        <button
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          type="button"
          onClick={handleSignOut}
        >
          ログアウト
        </button>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-700">M2で4タブUI（Read/Practice/Test/Challenge）を実装します。</p>
      </section>
      <Link className="text-sm font-medium text-blue-700 underline" to="/">
        ダッシュボードへ戻る
      </Link>
    </main>
  )
}
