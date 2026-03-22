import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { LearningProvider } from './contexts/LearningContext'
import { AchievementProvider } from './contexts/AchievementContext'
import { ConfigErrorView } from './components/ConfigErrorView'
import { PageSpinner } from './components/Spinner'
import { supabaseConfigError } from './lib/supabaseClient'
import './styles/globals.css'

// Route-based Code Splitting: 各ページを動的インポートでチャンク分割
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const SignUpPage = lazy(() => import('./pages/SignUpPage').then((m) => ({ default: m.SignUpPage })))
const StepPage = lazy(() => import('./pages/StepPage').then((m) => ({ default: m.StepPage })))

// ページ遷移中のフォールバック UI
function PageLoading() {
  return <PageSpinner />
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
    path: '/signup',
    element: (
      <GuestRoute>
        <Suspense fallback={<PageLoading />}>
          <SignUpPage />
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
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoading />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
])

async function startApp() {
  // VITE_API_BASE_URL 未設定時は MSW で API をモック（本番環境の API Practice 用）
  if (!import.meta.env.VITE_API_BASE_URL) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

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
}

void startApp()
