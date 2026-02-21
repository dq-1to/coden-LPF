import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { LearningProvider } from './contexts/LearningContext'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { StepPage } from './pages/StepPage'
import { ConfigErrorView } from './components/ConfigErrorView'
import { supabaseConfigError } from './lib/supabaseClient'
import './styles/globals.css'

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/step/:stepId',
    element: (
      <ProtectedRoute>
        <StepPage />
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
          <RouterProvider router={router} />
        </LearningProvider>
      </AuthProvider>
    </React.StrictMode>,
  )
}
