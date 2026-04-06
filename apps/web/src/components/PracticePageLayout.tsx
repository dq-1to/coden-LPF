import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSignOut } from '../hooks/useSignOut'
import { AppHeader } from '../features/dashboard/components/AppHeader'
import { getDisplayName } from '../shared/utils/getDisplayName'

interface PracticePageLayoutProps {
  children: React.ReactNode
}

export function PracticePageLayout({ children }: PracticePageLayoutProps) {
  const { user } = useAuth()
  const displayName = useMemo(() => getDisplayName(user), [user])
  const handleSignOut = useSignOut()

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50">
      <AppHeader displayName={displayName} onSignOut={() => void handleSignOut()} />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  )
}
