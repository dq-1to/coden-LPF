import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const testState = vi.hoisted(() => ({
  createAnnouncementMock: vi.fn(),
  authValue: {
    user: { id: '11111111-1111-1111-1111-111111111111' },
  },
}))

vi.mock('../../../features/admin/components/AdminLayout', () => ({
  AdminLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}))

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => testState.authValue,
}))

vi.mock('../../../hooks/useDocumentTitle', () => ({
  useDocumentTitle: () => undefined,
}))

vi.mock('../../../services/adminNotificationService', () => ({
  createAnnouncement: (...args: unknown[]) => testState.createAnnouncementMock(...args),
}))

import { AdminNotificationsPage } from '../AdminNotificationsPage'

const ADMIN_ID = '11111111-1111-1111-1111-111111111111'

function renderPage() {
  return render(<AdminNotificationsPage />)
}

describe('AdminNotificationsPage', () => {
  beforeEach(() => {
    testState.createAnnouncementMock.mockReset()
    testState.createAnnouncementMock.mockResolvedValue({
      id: '22222222-2222-2222-2222-222222222222',
    })
    testState.authValue = {
      user: { id: ADMIN_ID },
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('お知らせ送信フォームを表示する', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'お知らせを送る' })).toBeTruthy()
    expect(screen.getByLabelText('タイトル')).toBeTruthy()
    expect(screen.getByLabelText('本文')).toBeTruthy()
    expect(screen.getByLabelText('送信時刻')).toHaveProperty('value', '即時送信')
    expect(screen.getByLabelText('全ユーザー')).toHaveProperty('checked', true)
  })

  it('タイトルと本文が空のときは送信できない', () => {
    renderPage()

    expect(screen.getByRole('button', { name: 'お知らせを送る' })).toHaveProperty('disabled', true)
  })

  it('入力値を trim して createAnnouncement を呼ぶ', async () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: '  リリースのお知らせ  ' } })
    fireEvent.change(screen.getByLabelText('本文'), { target: { value: '  新しい機能を公開しました  ' } })
    fireEvent.click(screen.getByLabelText('学習者'))
    fireEvent.click(screen.getByRole('button', { name: 'お知らせを送る' }))

    await waitFor(() => {
      expect(testState.createAnnouncementMock).toHaveBeenCalledWith({
        adminId: ADMIN_ID,
        title: 'リリースのお知らせ',
        body: '新しい機能を公開しました',
        targetRole: 'learner',
      })
    })
    expect(await screen.findByText('お知らせを送信しました')).toBeTruthy()
    expect(screen.getByLabelText('タイトル')).toHaveProperty('value', '')
    expect(screen.getByLabelText('本文')).toHaveProperty('value', '')
    expect(screen.getByLabelText('全ユーザー')).toHaveProperty('checked', true)
  })

  it('管理者向け配信を選択できる', async () => {
    renderPage()

    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'admin title' } })
    fireEvent.change(screen.getByLabelText('本文'), { target: { value: 'admin body' } })
    fireEvent.click(screen.getByLabelText('管理者'))
    fireEvent.click(screen.getByRole('button', { name: 'お知らせを送る' }))

    await waitFor(() => {
      expect(testState.createAnnouncementMock).toHaveBeenCalledWith(
        expect.objectContaining({ targetRole: 'admin' }),
      )
    })
  })

  it('送信エラーを alert で表示する', async () => {
    testState.createAnnouncementMock.mockRejectedValue(new Error('お知らせの作成に失敗しました'))
    renderPage()

    fireEvent.change(screen.getByLabelText('タイトル'), { target: { value: 'title' } })
    fireEvent.change(screen.getByLabelText('本文'), { target: { value: 'body' } })
    fireEvent.click(screen.getByRole('button', { name: 'お知らせを送る' }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('お知らせの作成に失敗しました')
  })
})
