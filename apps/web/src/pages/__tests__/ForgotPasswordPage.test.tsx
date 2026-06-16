import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ForgotPasswordPage } from '../ForgotPasswordPage'

const mockSendPasswordResetEmail = vi.fn()

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    sendPasswordResetEmail: mockSendPasswordResetEmail,
  }),
}))

vi.mock('../../lib/supabaseClient', () => ({
  supabaseConfigError: null,
  supabase: {},
}))

describe('ForgotPasswordPage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mockSendPasswordResetEmail.mockReset()
  })

  it('不正なメールアドレスでは送信せずエラーを表示する', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('メールアドレス'), 'invalid-mail')
    await user.click(screen.getByRole('button', { name: 'リセットメールを送信' }))

    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toContain('正しいメールアドレスを入力してください。')
  })

  it('リセットメール送信に成功すると案内を表示する', async () => {
    const user = userEvent.setup()
    mockSendPasswordResetEmail.mockResolvedValue(null)

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('メールアドレス'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: 'リセットメールを送信' }))

    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
      'user@example.com',
      `${window.location.origin}/reset-password`,
    )
    expect(screen.getByRole('status').textContent).toContain('リセットメールを送信しました。')
  })
})
