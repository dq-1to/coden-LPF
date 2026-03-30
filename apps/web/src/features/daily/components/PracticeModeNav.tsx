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
    <nav className="w-44 shrink-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-light">
        練習モード
      </p>
      <ul className="space-y-1">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = pathname === path
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
  )
}
