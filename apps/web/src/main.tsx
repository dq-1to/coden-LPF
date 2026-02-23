import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { LearningProvider } from './contexts/LearningContext'
import { AchievementProvider } from './contexts/AchievementContext'
import { ConfigErrorView } from './components/ConfigErrorView'
import { supabaseConfigError } from './lib/supabaseClient'
import './styles/globals.css'

// Route-based Code Splitting: 各ページを動的インポートでチャンク分割
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const StepPage = lazy(() => import('./pages/StepPage').then((m) => ({ default: m.StepPage })))

// ページ遷移中のフォールバック UI
function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center" aria-live="polite" aria-label="ページを読み込み中">
      <div className="text-gray-500">読み込み中...</div>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Suspense fallback={<PageLoading />}>
          <LoginPage />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoading />}>
          <DashboardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/step/:stepId',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoading />}>
          <StepPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoading />}>
          <ProfilePage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

const rootElement = document.getElementById('root')!
const root = ReactDOM.createRoot(rootElement)

if (supabaseConfigError) {
  root.render(
    <React.StrictMode>
      <div className="flex min-h-screen items-center justify-center p-4">
        <ConfigErrorView message={supabaseConfigError} />
      </div>
    </React.StrictMode>,
  )
} else {
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <LearningProvider>
          <AchievementProvider>
            <RouterProvider router={router} />
          </AchievementProvider>
        </LearningProvider>
      </AuthProvider>
    </React.StrictMode>,
  )
}
