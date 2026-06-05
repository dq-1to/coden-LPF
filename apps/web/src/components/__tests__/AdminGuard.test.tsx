import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AdminGuard } from '../AdminGuard'

const mockAuth = vi.hoisted(() => ({
  value: {
    user: null as { id: string } | null,
    isLoadingAuth: false,
    isAdmin: false,
  },
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuth.value,
}))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<div>Login</div>} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <div>Admin Content</div>
            </AdminGuard>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminGuard', () => {
  afterEach(() => {
    cleanup()
    mockAuth.value = { user: null, isLoadingAuth: false, isAdmin: false }
  })

  it('認証状態ロード中はスピナーを表示する', () => {
    mockAuth.value = { user: null, isLoadingAuth: true, isAdmin: false }
    renderAt('/admin')
    expect(screen.getByRole('status', { name: '権限を確認中...' })).toBeTruthy()
  })

  it('未認証なら /login にリダイレクトする', () => {
    mockAuth.value = { user: null, isLoadingAuth: false, isAdmin: false }
    renderAt('/admin')
    expect(screen.getByText('Login')).toBeTruthy()
  })

  it('認証済みで非 admin なら / にリダイレクトする', () => {
    mockAuth.value = { user: { id: 'user-1' }, isLoadingAuth: false, isAdmin: false }
    renderAt('/admin')
    expect(screen.getByText('Home')).toBeTruthy()
    expect(screen.queryByText('Admin Content')).toBeNull()
  })

  it('認証済みで admin なら children を描画する', () => {
    mockAuth.value = { user: { id: 'admin-1' }, isLoadingAuth: false, isAdmin: true }
    renderAt('/admin')
    expect(screen.getByText('Admin Content')).toBeTruthy()
  })
})
