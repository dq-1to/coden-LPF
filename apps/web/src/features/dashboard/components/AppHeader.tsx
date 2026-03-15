import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { getFirstImplementedStep } from '@/content/courseData'
import { useLearningContext } from '@/contexts/LearningContext'

interface AppHeaderProps {
  displayName: string
  onSignOut: () => void
}

export function AppHeader({ displayName, onSignOut }: AppHeaderProps) {
  const { stats } = useLearningContext()
  const location = useLocation()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const firstImplementedStep = getFirstImplementedStep()
  const learningPath = firstImplementedStep ? `/step/${firstImplementedStep.id}` : '/'

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  // ページ遷移時にドロワーを閉じる
  useEffect(() => {
    closeDrawer()
  }, [location.pathname, closeDrawer])

  // ESCキーでドロワーを閉じる
  useEffect(() => {
    if (!isDrawerOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsDrawerOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen])

  // ドロワー開放中はbodyスクロールを無効化
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isDrawerOpen])

  const navLinkClass = (active: boolean) =>
    `pb-1 ${active ? 'border-b-2 border-primary-mint text-slate-900' : 'text-slate-500 hover:text-slate-700'}`

  const drawerLinkClass = (active: boolean) =>
    `block rounded-lg px-3 py-2.5 text-base font-medium transition ${active ? 'bg-secondary-bg text-primary-dark' : 'text-slate-700 hover:bg-slate-50'}`

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
              className={navLinkClass(location.pathname === '/')}
              aria-current={location.pathname === '/' ? 'page' : undefined}
            >
              ダッシュボード
            </Link>
            <Link
              to={learningPath}
              className={navLinkClass(location.pathname.startsWith('/step'))}
              aria-current={location.pathname.startsWith('/step') ? 'page' : undefined}
            >
              学習を始める
            </Link>
            <Link
              to="/profile"
              className={navLinkClass(location.pathname === '/profile')}
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
            className="hidden rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 md:block"
            type="button"
            onClick={onSignOut}
          >
            ログアウト
          </button>

          {/* モバイル: ハンバーガーボタン */}
          <button
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="メニューを開く"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* モバイルドロワー */}
      {isDrawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-black/30 transition-opacity"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* ドロワーパネル */}
          <nav
            className="absolute right-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl transition-transform duration-300"
            aria-label="モバイルナビゲーション"
          >
            {/* ヘッダー */}
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <span className="text-sm font-semibold text-slate-900">メニュー</span>
              <button
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                type="button"
                onClick={closeDrawer}
                aria-label="メニューを閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ユーザー情報 */}
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="text-sm font-medium text-slate-900">{displayName}</div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="rounded-full border border-amber-300/30 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  💎 {stats?.total_points ?? 0} Pt
                </span>
                <span className="rounded-full border border-primary-mint/30 bg-secondary-bg px-2 py-0.5 text-xs font-semibold text-primary-dark">
                  🔥 {stats?.current_streak ?? 0}日連続
                </span>
              </div>
            </div>

            {/* ナビゲーションリンク */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <Link
                to="/"
                className={drawerLinkClass(location.pathname === '/')}
                aria-current={location.pathname === '/' ? 'page' : undefined}
              >
                ダッシュボード
              </Link>
              <Link
                to={learningPath}
                className={drawerLinkClass(location.pathname.startsWith('/step'))}
                aria-current={location.pathname.startsWith('/step') ? 'page' : undefined}
              >
                学習を始める
              </Link>
              <Link
                to="/profile"
                className={drawerLinkClass(location.pathname === '/profile')}
                aria-current={location.pathname === '/profile' ? 'page' : undefined}
              >
                プロフィール
              </Link>
            </div>

            {/* ログアウトボタン */}
            <div className="border-t border-slate-200 px-3 py-3">
              <button
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                type="button"
                onClick={() => { closeDrawer(); onSignOut() }}
              >
                ログアウト
              </button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
