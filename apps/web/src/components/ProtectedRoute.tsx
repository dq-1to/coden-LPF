import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PageSpinner } from './Spinner'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoadingAuth, user } = useAuth()
  const location = useLocation()

  if (isLoadingAuth) {
    return <PageSpinner label="認証状態を確認中..." />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { isLoadingAuth, user } = useAuth()

  if (isLoadingAuth) {
    return <PageSpinner label="認証状態を確認中..." />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
