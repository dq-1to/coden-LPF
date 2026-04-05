import { Link, useLocation } from 'react-router-dom'
import { Zap, Stethoscope, FolderOpen, BookOpen } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/daily', label: 'デイリー', icon: Zap },
  { path: '/practice/code-doctor', label: 'ドクター', icon: Stethoscope },
  { path: '/practice/mini-projects', label: 'ミニプロ', icon: FolderOpen },
  { path: '/practice/code-reading', label: 'リーディング', icon: BookOpen },
]

export function PracticeModeNav() {
  const { pathname } = useLocation()

  return (
    <>
      {/* デスクトップ: サイドバー */}
      <nav className="hidden w-44 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-light">
          練習モード
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = pathname === path || pathname.startsWith(path + '/')
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={[
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-text-muted hover:bg-bg-surface hover:text-text-dark',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* モバイル: セグメンテッドコントロール */}
      <nav className="mb-2 flex rounded-lg border border-slate-200 bg-white p-0.5 lg:hidden" aria-label="練習モード">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = pathname === path || pathname.startsWith(path + '/')
          return (
            <Link
              key={path}
              to={path}
              className={[
                'flex flex-1 items-center justify-center gap-0.5 rounded-md px-0.5 py-2 text-[11px] font-medium transition-colors',
                isActive
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-text-muted hover:text-amber-600',
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={12} aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
