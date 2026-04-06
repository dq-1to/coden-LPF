import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SignUpPage } from '../SignUpPage'

const mockNavigate = vi.fn()
const mockSignUp = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    user: null,
  }),
}))

vi.mock('../../lib/supabaseClient', () => ({
  supabaseConfigError: null,
  supabase: {},
}))

describe('SignUpPage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mockNavigate.mockReset()
    mockSignUp.mockReset()
  })

  it('不正なメールアドレスでは送信せずエラーを表示する', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('メールアドレス'), 'invalid-mail')
    await user.type(screen.getByLabelText('パスワード'), 'password123')
    await user.click(screen.getByRole('button', { name: 'アカウントを作成' }))

    expect(mockSignUp).not.toHaveBeenCalled()
    const alerts = screen.getAllByRole('alert')
    expect(alerts.some((el) => el.textContent?.includes('正しいメールアドレスを入力してください。'))).toBe(true)
  })

  it('短すぎるパスワードでは送信せずエラーを表示する', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('メールアドレス'), 'user@example.com')
    await user.type(screen.getByLabelText('パスワード'), 'short')
    await user.click(screen.getByRole('button', { name: 'アカウントを作成' }))

    expect(mockSignUp).not.toHaveBeenCalled()
    const alerts = screen.getAllByRole('alert')
    expect(alerts.some((el) => el.textContent?.includes('パスワードは8文字以上で入力してください。'))).toBe(true)
  })

  it('登録成功時にダッシュボードへ遷移する', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue(null)

    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('メールアドレス'), 'user@example.com')
    await user.type(screen.getByLabelText('パスワード'), 'password123')
    await user.click(screen.getByRole('button', { name: 'アカウントを作成' }))

    expect(mockSignUp).toHaveBeenCalledWith('user@example.com', 'password123')
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('ログインページへの導線を表示する', () => {
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'ログインはこちら' }).getAttribute('href')).toBe('/login')
  })
})
