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

const TOP_NAV_LINKS = [
  { to: '/base-nook', label: 'ベースヌック', pathPrefix: '/base-nook' },
  { to: '/profile', label: 'プロフィール', pathPrefix: '/profile' },
] as const

export function AppHeader({ displayName, onSignOut }: AppHeaderProps) {
  const { stats } = useLearningContext()
  const location = useLocation()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    menuButtonRef.current?.focus()
  }, [])

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
      if (e.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen, closeDrawer])

  // フォーカストラップ: ドロワー内にフォーカスを閉じ込める
  useEffect(() => {
    if (!isDrawerOpen) return
    const nav = drawerRef.current
    if (!nav) return
    const focusable = Array.from(nav.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return
    // クロージャ内で型ナローイングを維持するためにローカル変数に再代入
    const firstEl: HTMLElement = first
    const lastEl: HTMLElement = last
    firstEl.focus()
    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === firstEl) { e.preventDefault(); lastEl.focus() }
      } else {
        if (document.activeElement === lastEl) { e.preventDefault(); firstEl.focus() }
      }
    }
    nav.addEventListener('keydown', handleTab)
    return () => nav.removeEventListener('keydown', handleTab)
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

          <nav className="hidden items-center gap-5 text-sm font-medium lg:flex" aria-label="メインナビゲーション">
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
                aria-controls="curriculum-menu"
              >
                カリキュラム
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {isDropdownOpen && (
                <div id="curriculum-menu" role="menu" className="absolute left-0 top-full mt-2 w-56 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    学習コース
                  </div>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/curriculum#${cat.id}`}
                      role="menuitem"
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
                      role="menuitem"
                      className="block px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {TOP_NAV_LINKS.map((link) => {
              const isActive = location.pathname.startsWith(link.pathPrefix)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={navLinkClass(isActive)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
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
            className="hidden rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 lg:block"
            type="button"
            onClick={onSignOut}
          >
            ログアウト
          </button>

          {/* モバイル: ハンバーガーボタン */}
          <button
            ref={menuButtonRef}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="メニューを開く"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>

    {/* モバイルドロワー — フルスクリーン */}
    {isDrawerOpen ? (
      <nav
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden"
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
        <div className="border-b border-slate-100 px-4 py-4">
          <p className="font-semibold text-slate-900">{displayName}</p>
          <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
            <span><Gem className="inline-block h-3.5 w-3.5 text-amber-600" aria-hidden="true" /> {stats?.total_points ?? 0} Pt</span>
            <span aria-hidden="true">·</span>
            <span><Flame className="inline-block h-3.5 w-3.5 text-primary-mint" aria-hidden="true" /> {stats?.current_streak ?? 0}日連続</span>
          </div>
        </div>

        {/* ナビゲーションリンク */}
        <div className="flex-1 overflow-y-auto">
          {/* メイン */}
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">メイン</p>
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
          </div>

          {/* 学習コース */}
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">学習コース</p>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/curriculum#${cat.id}`}
                className={drawerLinkClass(false)}
              >
                {cat.title}
              </Link>
            ))}
          </div>

          {/* 練習モード */}
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">練習モード</p>
            {PRACTICE_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={drawerLinkClass(location.pathname.startsWith(link.to))}
                aria-current={location.pathname.startsWith(link.to) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* その他 */}
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">その他</p>
            {TOP_NAV_LINKS.map((link) => {
              const isActive = location.pathname.startsWith(link.pathPrefix)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={drawerLinkClass(isActive)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* ログアウトボタン */}
        <div className="border-t border-slate-200 px-4 py-3">
          <button
            className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={() => { closeDrawer(); onSignOut() }}
          >
            ログアウト
          </button>
        </div>
      </nav>
    ) : null}
    </>
  )
}
