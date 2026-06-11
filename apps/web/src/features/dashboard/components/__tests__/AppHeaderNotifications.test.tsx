import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppHeader } from '../AppHeader'

const testState = vi.hoisted(() => ({
  getUnreadCountMock: vi.fn(),
  notificationListener: null as (() => void) | null,
}))

vi.mock('@/contexts/LearningContext', () => ({
  useLearningContext: () => ({
    stats: {
      total_points: 200,
      current_streak: 5,
    },
  }),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '11111111-1111-1111-1111-111111111111' },
    isAdmin: false,
  }),
}))

vi.mock('@/contexts/FeedbackContext', () => ({
  useFeedbackContext: () => ({ openFeedback: vi.fn() }),
}))

vi.mock('@/services/notificationService', () => ({
  getUnreadCount: (...args: unknown[]) => testState.getUnreadCountMock(...args),
  subscribeNotificationsUpdated: (listener: () => void) => {
    testState.notificationListener = listener
    return () => {
      testState.notificationListener = null
    }
  },
}))

function renderHeader(pathname = '/') {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <AppHeader displayName="テストユーザー" onSignOut={() => undefined} />
    </MemoryRouter>,
  )
}

describe('AppHeader お知らせ入口', () => {
  beforeEach(() => {
    testState.getUnreadCountMock.mockReset()
    testState.getUnreadCountMock.mockResolvedValue(0)
    testState.notificationListener = null
  })

  afterEach(() => {
    cleanup()
  })

  it('デスクトップヘッダーにお知らせリンクを表示する', async () => {
    renderHeader()

    const link = await screen.findByRole('link', { name: 'お知らせ' })
    expect(link.getAttribute('href')).toBe('/notifications')
  })

  it('未読がある場合は新着バッジを表示する', async () => {
    testState.getUnreadCountMock.mockResolvedValue(3)
    renderHeader()

    expect(await screen.findByRole('link', { name: 'お知らせ、未読 3 件' })).toBeTruthy()
    expect(screen.getByText('新着')).toBeTruthy()
  })

  it('通知更新イベントで未読件数を再取得する', async () => {
    testState.getUnreadCountMock.mockResolvedValueOnce(0).mockResolvedValueOnce(2)
    renderHeader()

    await screen.findByRole('link', { name: 'お知らせ' })
    testState.notificationListener?.()

    expect(await screen.findByRole('link', { name: 'お知らせ、未読 2 件' })).toBeTruthy()
    expect(testState.getUnreadCountMock).toHaveBeenCalledTimes(2)
  })

  it('モバイルドロワーにもお知らせリンクと新着バッジを表示する', async () => {
    testState.getUnreadCountMock.mockResolvedValue(1)
    renderHeader()

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'お知らせ、未読 1 件' })).toBeTruthy()
    })
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))

    const drawer = screen.getByRole('dialog', { name: 'モバイルナビゲーション' })
    const link = within(drawer).getByRole('link', { name: 'お知らせ、未読 1 件' })
    expect(link.getAttribute('href')).toBe('/notifications')
    expect(within(drawer).getByText('新着')).toBeTruthy()
  })
})
