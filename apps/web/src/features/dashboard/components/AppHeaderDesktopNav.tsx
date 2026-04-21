import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, MessageSquarePlus, Shield } from 'lucide-react'
import { CATEGORIES } from '@/content/courseData'
import { PRACTICE_LINKS, TOP_NAV_LINKS } from './appHeaderLinks'

interface AppHeaderDesktopNavProps {
  pathname: string
  isAdmin: boolean
  openFeedback: () => void
  navLinkClass: (active: boolean) => string
}

export function AppHeaderDesktopNav({ pathname, isAdmin, openFeedback, navLinkClass }: AppHeaderDesktopNavProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isCurriculumActive =
    pathname === '/curriculum' ||
    pathname.startsWith('/step') ||
    pathname.startsWith('/daily') ||
    pathname.startsWith('/practice')

  // ページ遷移時にドロップダウンを閉じる
  useEffect(() => {
    setIsDropdownOpen(false)
  }, [pathname])

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

  return (
    <nav className="hidden items-center gap-5 text-sm font-medium md:flex" aria-label="メインナビゲーション">
      <Link
        to="/"
        className={navLinkClass(pathname === '/')}
        aria-current={pathname === '/' ? 'page' : undefined}
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

            <div className="my-1.5 border-t border-slate-100" />
            <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              サポート
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsDropdownOpen(false)
                openFeedback()
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
              フィードバックを送る
            </button>

            {isAdmin ? (
              <>
                <div className="my-1.5 border-t border-slate-100" />
                <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  管理
                </div>
                <Link
                  to="/admin"
                  role="menuitem"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                  管理画面
                </Link>
              </>
            ) : null}
          </div>
        )}
      </div>

      {TOP_NAV_LINKS.map((link) => {
        const isActive = pathname.startsWith(link.pathPrefix)
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
  )
}
