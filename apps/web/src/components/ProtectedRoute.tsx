import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
        <p className="text-sm text-slate-600">認証状態を確認中...</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
        <p className="text-sm text-slate-600">認証状態を確認中...</p>
      </main>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
