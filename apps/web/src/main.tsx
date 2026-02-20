import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { StepPage } from './pages/StepPage'
import './styles/globals.css'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <DashboardPage /> },
  { path: '/step/:stepId', element: <StepPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
