import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from '../LoginPage'

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    user: null,
  }),
}))

vi.mock('../../lib/supabaseClient', () => ({
  supabaseConfigError: null,
  supabase: {},
}))

describe('LoginPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('パスワードリセット導線を表示する', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'パスワードを忘れた方はこちら' }).getAttribute('href')).toBe(
      '/forgot-password',
    )
  })
})
