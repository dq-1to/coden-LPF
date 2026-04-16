import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useGreetingName } from '../../../hooks/useGreetingName'
import { useSignOut } from '../../../hooks/useSignOut'
import { AppHeader } from '../../dashboard/components/AppHeader'

interface AdminLayoutProps {
  children: ReactNode
}

interface AdminLink {
  to: string
  label: string
  exact?: boolean
}

const ADMIN_LINKS: readonly AdminLink[] = [
  { to: '/admin', label: 'ダッシュボード', exact: true },
  { to: '/admin/feedback', label: 'フィードバック' },
  { to: '/admin/users', label: 'ユーザー' },
  { to: '/admin/stats', label: '統計' },
  { to: '/admin/ops', label: '運用' },
]

function isLinkActive(pathname: string, to: string, exact?: boolean): boolean {
  if (exact) return pathname === to
  return pathname.startsWith(to)
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { greetingName } = useGreetingName()
  const handleSignOut = useSignOut(() => undefined)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader displayName={greetingName} onSignOut={() => void handleSignOut()} />

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {ADMIN_LINKS.map((link) => {
            const active = isLinkActive(location.pathname, link.to, link.exact)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition ${
                  active
                    ? 'border-primary-mint text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
