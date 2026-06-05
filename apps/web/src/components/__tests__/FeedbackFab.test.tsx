import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FeedbackFab } from '../FeedbackFab'

const mockAuth = vi.hoisted(() => ({
  value: { user: { id: 'u1' } as { id: string } | null },
}))

const mockFeedback = vi.hoisted(() => ({
  openFeedback: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth.value,
}))

vi.mock('@/contexts/FeedbackContext', () => ({
  useFeedbackContext: () => mockFeedback,
}))

afterEach(() => {
  cleanup()
  mockAuth.value = { user: { id: 'u1' } }
  mockFeedback.openFeedback.mockReset()
})

describe('FeedbackFab', () => {
  it('ログイン済みユーザーに FAB が表示される', () => {
    render(<FeedbackFab />)
    expect(screen.getByRole('button', { name: 'フィードバックを送る' })).toBeTruthy()
  })

  it('未ログイン時は FAB が表示されない', () => {
    mockAuth.value = { user: null }
    const { container } = render(<FeedbackFab />)
    expect(container.firstChild).toBeNull()
  })

  it('FAB クリックで openFeedback が呼ばれる', () => {
    render(<FeedbackFab />)
    screen.getByRole('button', { name: 'フィードバックを送る' }).click()
    expect(mockFeedback.openFeedback).toHaveBeenCalledOnce()
  })

  it('FAB が画面右下に固定されている', () => {
    render(<FeedbackFab />)
    const btn = screen.getByRole('button', { name: 'フィードバックを送る' })
    expect(btn.className).toContain('fixed')
    expect(btn.className).toContain('bottom-5')
    expect(btn.className).toContain('right-5')
  })
})
