import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('ページが見つかりません')

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <img src="/coden_logo.png" alt="Coden Logo" className="h-12 w-12 object-contain" />
          <p className="font-display text-2xl font-bold tracking-tight text-primary-mint">Coden MVP</p>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">404 Not Found</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900">ページが見つかりません</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          指定したURLのページは存在しないか、移動した可能性があります。学習を続ける場合はダッシュボードへ戻ってください。
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex items-center justify-center rounded-md bg-primary-mint px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark active:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-primary-mint/30"
          to="/"
        >
          ダッシュボードへ戻る
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          to="/login"
        >
          ログインページを見る
        </Link>
      </div>
    </main>
  )
}
