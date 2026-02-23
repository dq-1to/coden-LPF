import { Link, useLocation } from 'react-router-dom'
import { useLearningContext } from '../../../contexts/LearningContext'

interface AppHeaderProps {
  displayName: string
  onSignOut: () => void
}

export function AppHeader({ displayName, onSignOut }: AppHeaderProps) {
  const { stats } = useLearningContext()
  const location = useLocation()
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2" aria-label="Coden ホームへ戻る">
            <img src="/coden_logo.png" alt="Coden Logo" className="h-10 w-10 object-contain" />
            <span className="font-display text-2xl font-bold tracking-tight text-primary-mint">Coden</span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-medium md:flex" aria-label="メインナビゲーション">
            <Link
              to="/"
              className={`pb-1 ${location.pathname === '/'
                ? 'border-b-2 border-primary-mint text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
                }`}
              aria-current={location.pathname === '/' ? 'page' : undefined}
            >
              ダッシュボード
            </Link>
            <Link
              to="/"
              className={`pb-1 ${location.pathname.startsWith('/step')
                ? 'border-b-2 border-primary-mint text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
                }`}
              aria-current={location.pathname.startsWith('/step') ? 'page' : undefined}
            >
              コース一覧
            </Link>
            <Link
              to="/profile"
              className={`pb-1 ${location.pathname === '/profile'
                ? 'border-b-2 border-primary-mint text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
                }`}
              aria-current={location.pathname === '/profile' ? 'page' : undefined}
            >
              プロフィール
            </Link>
            <span className="cursor-not-allowed pb-1 text-slate-400" aria-disabled="true">コミュニティ (準備中)</span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-amber-300/30 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 sm:block">
            💎 {stats?.total_points ?? 0} Pt
          </div>
          <div className="hidden rounded-full border border-primary-mint/30 bg-secondary-bg px-3 py-1 text-xs font-semibold text-primary-dark sm:block">
            🔥 {stats?.current_streak ?? 0}日連続
          </div>
          <div className="hidden text-sm font-medium text-slate-600 sm:block">{displayName}</div>
          <button
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={onSignOut}
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  )
}
