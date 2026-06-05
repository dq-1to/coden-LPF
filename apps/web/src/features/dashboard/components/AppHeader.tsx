import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Flame, Gem, Menu } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useFeedbackContext } from '@/contexts/FeedbackContext'
import { useLearningContext } from '@/contexts/LearningContext'
import { AppHeaderDesktopNav } from './AppHeaderDesktopNav'
import { AppHeaderMobileDrawer } from './AppHeaderMobileDrawer'

interface AppHeaderProps {
  displayName: string
  onSignOut: () => void
}

export function AppHeader({ displayName, onSignOut }: AppHeaderProps) {
  const { stats } = useLearningContext()
  const { isAdmin } = useAuth()
  const { openFeedback } = useFeedbackContext()
  const location = useLocation()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    menuButtonRef.current?.focus()
  }, [])

  // ページ遷移時にドロワーを閉じる
  useEffect(() => {
    closeDrawer()
  }, [location.pathname, closeDrawer])

  const navLinkClass = (active: boolean) =>
    `pb-1 ${active ? 'border-b-2 border-primary-mint text-slate-900' : 'text-slate-500 hover:text-slate-700'}`

  const drawerLinkClass = (active: boolean) =>
    `flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium transition ${active ? 'bg-secondary-bg text-primary-dark' : 'text-slate-700 hover:bg-slate-50'}`

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2" aria-label="Coden ホームへ戻る">
            <img src="/coden_logo.png" alt="Coden Logo" className="h-10 w-10 object-contain" />
            <span className="font-display text-2xl font-bold tracking-tight text-primary-mint">Coden</span>
          </Link>

          <AppHeaderDesktopNav
            pathname={location.pathname}
            isAdmin={isAdmin}
            openFeedback={openFeedback}
            navLinkClass={navLinkClass}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-amber-300/30 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 sm:block">
            <Gem className="inline-block h-3.5 w-3.5" aria-hidden="true" /> {stats?.total_points ?? 0} Pt
          </div>
          <div className="hidden rounded-full border border-primary-mint/30 bg-secondary-bg px-3 py-1 text-xs font-semibold text-primary-dark sm:block">
            <Flame className="inline-block h-3.5 w-3.5" aria-hidden="true" /> {stats?.current_streak ?? 0}日連続
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
            ref={menuButtonRef}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="メニューを開く"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>

    {isDrawerOpen ? (
      <AppHeaderMobileDrawer
        displayName={displayName}
        pathname={location.pathname}
        stats={stats}
        isAdmin={isAdmin}
        openFeedback={openFeedback}
        onClose={closeDrawer}
        onSignOut={onSignOut}
        drawerLinkClass={drawerLinkClass}
      />
    ) : null}

    </>
  )
}
