import { Link, useLocation } from 'react-router-dom'
import { Zap, Stethoscope, FolderOpen, BookOpen } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/daily', label: 'デイリー', purpose: '昨日の復習', icon: Zap },
  { path: '/practice/code-doctor', label: 'ドクター', purpose: 'バグ修正', icon: Stethoscope },
  { path: '/practice/mini-projects', label: 'ミニプロ', purpose: '成果物作成', icon: FolderOpen },
  { path: '/practice/code-reading', label: 'リーディング', purpose: 'コードを読む', icon: BookOpen },
]

export function PracticeModeNav() {
  const { pathname } = useLocation()

  return (
    <>
      {/* デスクトップ: サイドバー */}
      <nav className="hidden w-44 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:block" aria-label="練習モード">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-light">
          練習モード
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ path, label, purpose, icon: Icon }) => {
            const isActive = pathname === path || pathname.startsWith(path + '/')
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={[
                    'flex items-start gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-text-muted hover:bg-bg-surface hover:text-text-dark',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block leading-tight">{label}</span>
                    <span className={`mt-0.5 block text-[11px] leading-tight ${isActive ? 'text-amber-700/75' : 'text-slate-400'}`}>
                      {purpose}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* モバイル: セグメンテッドコントロール */}
      <nav className="mb-2 flex rounded-lg border border-slate-200 bg-white p-0.5 lg:hidden" aria-label="練習モード">
        {NAV_ITEMS.map(({ path, label, purpose, icon: Icon }) => {
          const isActive = pathname === path || pathname.startsWith(path + '/')
          return (
            <Link
              key={path}
              to={path}
              className={[
                'flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-0.5 py-1.5 text-center text-[11px] font-medium transition-colors',
                isActive
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-text-muted hover:text-amber-600',
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="flex items-center justify-center gap-0.5">
                <Icon size={12} aria-hidden="true" />
                <span>{label}</span>
              </span>
              <span className={`text-[9px] leading-none ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                {purpose}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
