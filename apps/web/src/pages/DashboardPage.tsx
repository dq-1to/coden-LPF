import { Link } from 'react-router-dom'
import { ConfigErrorView } from '../components/ConfigErrorView'
import { supabaseConfigError } from '../lib/supabaseClient'

export function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-slate-600">M1-1: ルーティングと接続基盤の確認用</p>
      </header>

      {supabaseConfigError ? <ConfigErrorView message={supabaseConfigError} /> : null}

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">学習中コース</p>
          <p className="mt-2 text-xl font-semibold">React基礎</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">完了ステップ</p>
          <p className="mt-2 text-xl font-semibold">0 / 4</p>
        </article>
      </section>

      <Link className="text-sm font-medium text-blue-700 underline" to="/step/usestate-basic">
        学習画面へ（/step/usestate-basic）
      </Link>
    </main>
  )
}
