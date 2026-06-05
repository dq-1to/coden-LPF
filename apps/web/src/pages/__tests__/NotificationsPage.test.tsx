import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NotificationsPage } from '../NotificationsPage'
import type { NotificationWithRead } from '@/services/notificationService'

const testState = vi.hoisted(() => ({
  getNotificationsMock: vi.fn(),
  markAsReadMock: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'tester@example.com',
      user_metadata: {},
    },
    signOut: vi.fn(),
  }),
}))

vi.mock('@/hooks/useGreetingName', () => ({
  useGreetingName: () => ({ greetingName: 'テストユーザー' }),
}))

vi.mock('@/hooks/useSignOut', () => ({
  useSignOut: () => vi.fn(),
}))

vi.mock('@/features/dashboard/components/AppHeader', () => ({
  AppHeader: ({ displayName }: { displayName: string }) => <header>{displayName} header</header>,
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabaseConfigError: null,
}))

vi.mock('@/services/notificationService', () => ({
  getNotifications: (...args: unknown[]) => testState.getNotificationsMock(...args),
  markAsRead: (...args: unknown[]) => testState.markAsReadMock(...args),
}))

const USER_ID = '11111111-1111-1111-1111-111111111111'
const NOTIFICATION_ID = '22222222-2222-2222-2222-222222222222'

function createNotification(overrides: Partial<NotificationWithRead> = {}): NotificationWithRead {
  return {
    id: NOTIFICATION_ID,
    type: 'announcement',
    title: 'メンテナンスのお知らせ',
    body: '明日の朝に短いメンテナンスがあります。',
    target_role: 'all',
    created_by: null,
    published_at: '2026-06-05T00:00:00Z',
    created_at: '2026-06-05T00:00:00Z',
    readAt: null,
    isRead: false,
    ...overrides,
  }
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    testState.getNotificationsMock.mockReset()
    testState.getNotificationsMock.mockResolvedValue([])
    testState.markAsReadMock.mockReset()
    testState.markAsReadMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
  })

  it('空状態を表示する', async () => {
    render(<NotificationsPage />)

    expect(await screen.findByText('まだ届いているお知らせはありません')).toBeTruthy()
    expect(testState.getNotificationsMock).toHaveBeenCalledWith({ userId: USER_ID })
  })

  it('通知一覧と未読件数を表示する', async () => {
    testState.getNotificationsMock.mockResolvedValue([
      createNotification(),
      createNotification({
        id: '33333333-3333-3333-3333-333333333333',
        title: '確認済みのお知らせ',
        readAt: '2026-06-05T01:00:00Z',
        isRead: true,
      }),
    ])

    render(<NotificationsPage />)

    expect(await screen.findByText('メンテナンスのお知らせ')).toBeTruthy()
    expect(screen.getByText('確認済みのお知らせ')).toBeTruthy()
    expect(screen.getByText('新着 1 件')).toBeTruthy()
    expect(screen.getByRole('button', { name: /確認済みにする/ })).toBeTruthy()
  })

  it('未読通知を確認済みにできる', async () => {
    testState.getNotificationsMock.mockResolvedValue([createNotification()])
    render(<NotificationsPage />)

    fireEvent.click(await screen.findByRole('button', { name: /確認済みにする/ }))

    await waitFor(() => {
      expect(testState.markAsReadMock).toHaveBeenCalledWith(NOTIFICATION_ID, USER_ID)
    })
    expect(screen.getByText('新着 0 件')).toBeTruthy()
    expect(screen.getByText('確認済み')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /確認済みにする/ })).toBeNull()
  })

  it('取得エラーを表示する', async () => {
    testState.getNotificationsMock.mockRejectedValue(new Error('お知らせ一覧の取得に失敗しました'))
    render(<NotificationsPage />)

    expect(await screen.findByText('お知らせ一覧の取得に失敗しました')).toBeTruthy()
  })

  it('既読化エラーを表示する', async () => {
    testState.getNotificationsMock.mockResolvedValue([createNotification()])
    testState.markAsReadMock.mockRejectedValue(new Error('お知らせを確認済みにできませんでした'))
    render(<NotificationsPage />)

    fireEvent.click(await screen.findByRole('button', { name: /確認済みにする/ }))

    expect(await screen.findByText('お知らせを確認済みにできませんでした')).toBeTruthy()
    expect(screen.getByText('新着 1 件')).toBeTruthy()
  })
})
