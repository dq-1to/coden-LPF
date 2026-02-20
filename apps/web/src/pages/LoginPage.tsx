import { Link } from 'react-router-dom'
import { ConfigErrorView } from '../components/ConfigErrorView'
import { supabaseConfigError } from '../lib/supabaseClient'

export function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-bold">Coden MVP</h1>
      <p className="text-slate-600">ログイン画面（M1-2でフォーム実装予定）</p>
      {supabaseConfigError ? <ConfigErrorView message={supabaseConfigError} /> : null}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-700">次タスクでメール/パスワード認証を実装します。</p>
      </div>
      <Link className="text-sm font-medium text-blue-700 underline" to="/">
        ダッシュボードへ（仮遷移）
      </Link>
    </main>
  )
}
