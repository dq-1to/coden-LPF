import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Flame, Gem, Menu, X } from 'lucide-react'
import { CATEGORIES } from '@/content/courseData'
import { useLearningContext } from '@/contexts/LearningContext'

interface AppHeaderProps {
  displayName: string
  onSignOut: () => void
}

const PRACTICE_LINKS = [
  { to: '/daily', label: 'デイリーチャレンジ' },
  { to: '/practice/code-doctor', label: 'コードドクター' },
  { to: '/practice/mini-projects', label: 'ミニプロジェクト' },
  { to: '/practice/code-reading', label: 'コードリーディング' },
] as const

export function AppHeader({ displayName, onSignOut }: AppHeaderProps) {
  const { stats } = useLearningContext()
  const location = useLocation()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  const isCurriculumActive =
    location.pathname === '/curriculum' ||
    location.pathname.startsWith('/step') ||
    location.pathname.startsWith('/daily') ||
    location.pathname.startsWith('/practice')

  // ページ遷移時にドロワー・ドロップダウンを閉じる
  useEffect(() => {
    closeDrawer()
    setIsDropdownOpen(false)
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

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    if (!isDropdownOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

  const navLinkClass = (active: boolean) =>
    `pb-1 ${active ? 'border-b-2 border-primary-mint text-slate-900' : 'text-slate-500 hover:text-slate-700'}`

  const drawerLinkClass = (active: boolean) =>
    `block rounded-lg px-3 py-2.5 text-base font-medium transition ${active ? 'bg-secondary-bg text-primary-dark' : 'text-slate-700 hover:bg-slate-50'}`

  const drawerSubLinkClass =
    'block rounded-lg px-3 py-2 pl-6 text-sm text-slate-600 transition hover:bg-slate-50'

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

            {/* カリキュラム ドロップダウン */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className={`flex items-center gap-1 ${navLinkClass(isCurriculumActive)}`}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                カリキュラム
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    学習コース
                  </div>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/curriculum#${cat.id}`}
                      className="block px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      {cat.title}
                    </Link>
                  ))}

                  <div className="my-1.5 border-t border-slate-100" />

                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    練習モード
                  </div>
                  {PRACTICE_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/profile"
              className={navLinkClass(location.pathname === '/profile')}
              aria-current={location.pathname === '/profile' ? 'page' : undefined}
            >
              プロフィール
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-amber-300/30 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 sm:block">
            <Gem className="inline-block h-3.5 w-3.5" /> {stats?.total_points ?? 0} Pt
          </div>
          <div className="hidden rounded-full border border-primary-mint/30 bg-secondary-bg px-3 py-1 text-xs font-semibold text-primary-dark sm:block">
            <Flame className="inline-block h-3.5 w-3.5" /> {stats?.current_streak ?? 0}日連続
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
                  <Gem className="inline-block h-3.5 w-3.5" /> {stats?.total_points ?? 0} Pt
                </span>
                <span className="rounded-full border border-primary-mint/30 bg-secondary-bg px-2 py-0.5 text-xs font-semibold text-primary-dark">
                  <Flame className="inline-block h-3.5 w-3.5" /> {stats?.current_streak ?? 0}日連続
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
                to="/curriculum"
                className={drawerLinkClass(isCurriculumActive)}
                aria-current={location.pathname === '/curriculum' ? 'page' : undefined}
              >
                カリキュラム
              </Link>

              {/* カテゴリ */}
              <div className="ml-2 border-l border-slate-200 pl-1">
                {CATEGORIES.map((cat) => (
                  <Link key={cat.id} to={`/curriculum#${cat.id}`} className={drawerSubLinkClass}>
                    {cat.title}
                  </Link>
                ))}
              </div>

              {/* 練習モード */}
              <div className="mb-2 ml-2 border-l border-slate-200 pl-1">
                {PRACTICE_LINKS.map((link) => (
                  <Link key={link.to} to={link.to} className={drawerSubLinkClass}>
                    {link.label}
                  </Link>
                ))}
              </div>

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
