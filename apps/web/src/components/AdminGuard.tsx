import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PageSpinner } from './Spinner'

/**
 * 管理者専用ルートを保護する。
 * - 未認証: /login へ（`ProtectedRoute` と二段構えで使う想定、単体でも動作）
 * - 非 admin: / へリダイレクト
 * - admin: children を描画
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { isLoadingAuth, user, isAdmin } = useAuth()
  const location = useLocation()

  if (isLoadingAuth) {
    return <PageSpinner label="権限を確認中..." />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
