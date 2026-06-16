import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ResetPasswordPage } from '../ResetPasswordPage'

const mockUpdatePassword = vi.fn()
const mockSignOut = vi.fn()

interface MockAuthValue {
  isLoadingAuth: boolean
  session: { user: { id: string } } | null
  updatePassword: typeof mockUpdatePassword
  signOut: typeof mockSignOut
}

const mockAuth = {
  value: {
    isLoadingAuth: false,
    session: { user: { id: 'user-1' } },
    updatePassword: mockUpdatePassword,
    signOut: mockSignOut,
  } as MockAuthValue,
}

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuth.value,
}))

vi.mock('../../lib/supabaseClient', () => ({
  supabaseConfigError: null,
  supabase: {},
}))

describe('ResetPasswordPage', () => {
  afterEach(() => {
    cleanup()
    window.history.replaceState(null, '', '/')
  })

  beforeEach(() => {
    mockUpdatePassword.mockReset()
    mockSignOut.mockReset()
    mockAuth.value = {
      isLoadingAuth: false,
      session: { user: { id: 'user-1' } },
      updatePassword: mockUpdatePassword,
      signOut: mockSignOut,
    }
  })

  it('session がない場合は無効リンクとして再送信導線を表示する', () => {
    mockAuth.value = {
      ...mockAuth.value,
      session: null,
    }
    window.history.replaceState(null, '', '/reset-password#error_description=Recovery+link+expired')

    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert').textContent).toContain('Recovery link expired')
    expect(screen.getByRole('link', { name: 'リセットメールを再送信する' }).getAttribute('href')).toBe(
      '/forgot-password',
    )
  })

  it('短すぎるパスワードでは更新せずエラーを表示する', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('新しいパスワード'), 'short')
    await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'short')
    await user.click(screen.getByRole('button', { name: 'パスワードを更新' }))

    expect(mockUpdatePassword).not.toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toContain('パスワードは8文字以上で入力してください。')
  })

  it('パスワード更新に成功するとサインアウトして完了表示にする', async () => {
    const user = userEvent.setup()
    mockUpdatePassword.mockResolvedValue(null)
    mockSignOut.mockResolvedValue(null)

    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('新しいパスワード'), 'new-password123')
    await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'new-password123')
    await user.click(screen.getByRole('button', { name: 'パスワードを更新' }))

    expect(mockUpdatePassword).toHaveBeenCalledWith('new-password123')
    expect(mockSignOut).toHaveBeenCalled()
    expect(await screen.findByText('パスワードを更新しました')).toBeTruthy()
  })
})
