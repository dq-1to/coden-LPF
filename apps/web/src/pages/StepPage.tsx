import { Link, useParams } from 'react-router-dom'

export function StepPage() {
  const { stepId } = useParams()

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">学習画面</h1>
        <p className="text-slate-600">stepId: {stepId}</p>
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
