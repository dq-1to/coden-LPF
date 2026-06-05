import { useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Gem, MessageSquarePlus, Shield, X } from 'lucide-react'
import { CATEGORIES } from '@/content/courseData'
import type { LearningStats } from '@/services/statsService'
import { PRACTICE_LINKS, TOP_NAV_LINKS } from './appHeaderLinks'

interface AppHeaderMobileDrawerProps {
  displayName: string
  pathname: string
  stats: LearningStats | null
  isAdmin: boolean
  openFeedback: () => void
  onClose: () => void
  onSignOut: () => void
  drawerLinkClass: (active: boolean) => string
}

export function AppHeaderMobileDrawer({
  displayName,
  pathname,
  stats,
  isAdmin,
  openFeedback,
  onClose,
  onSignOut,
  drawerLinkClass,
}: AppHeaderMobileDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null)

  const isCurriculumActive =
    pathname === '/curriculum' ||
    pathname.startsWith('/step') ||
    pathname.startsWith('/daily') ||
    pathname.startsWith('/practice')

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // ESCキーでドロワーを閉じる
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleClose])

  // フォーカストラップ: ドロワー内にフォーカスを閉じ込める
  useEffect(() => {
    const nav = drawerRef.current
    if (!nav) return
    const focusable = Array.from(nav.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return
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
  }, [])

  // body スクロール無効化
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <nav
      ref={drawerRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-white md:hidden"
      aria-label="モバイルナビゲーション"
    >
      {/* ヘッダー */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
        <span className="text-sm font-semibold text-slate-900">メニュー</span>
        <button
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
          type="button"
          onClick={handleClose}
          aria-label="メニューを閉じる"
        >
          <X className="h-5 w-5" aria-hidden="true" />
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
            className={drawerLinkClass(pathname === '/')}
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            ダッシュボード
          </Link>
          <Link
            to="/curriculum"
            className={drawerLinkClass(isCurriculumActive)}
            aria-current={pathname === '/curriculum' ? 'page' : undefined}
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
              className={drawerLinkClass(pathname.startsWith(link.to))}
              aria-current={pathname.startsWith(link.to) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* その他 */}
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">その他</p>
          {TOP_NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.pathPrefix)
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

        {/* サポート（全ユーザー） */}
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">サポート</p>
          <button
            type="button"
            onClick={() => {
              handleClose()
              openFeedback()
            }}
            className={`${drawerLinkClass(false)} w-full`}
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" aria-hidden="true" />
            フィードバックを送る
          </button>
        </div>

        {/* 管理（admin のみ） */}
        {isAdmin ? (
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">管理</p>
            <Link
              to="/admin"
              className={drawerLinkClass(pathname.startsWith('/admin'))}
              aria-current={pathname.startsWith('/admin') ? 'page' : undefined}
            >
              <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
              管理画面
            </Link>
          </div>
        ) : null}
      </div>

      {/* ログアウトボタン */}
      <div className="border-t border-slate-200 px-4 py-3">
        <button
          className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          type="button"
          onClick={() => { handleClose(); onSignOut() }}
        >
          ログアウト
        </button>
      </div>
    </nav>
  )
}
