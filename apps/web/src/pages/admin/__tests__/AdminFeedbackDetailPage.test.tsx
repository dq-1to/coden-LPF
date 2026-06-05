import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Mocks ──────────────────────────────────────────────────────

const mockAuth = vi.hoisted(() => ({
  value: {
    user: { id: 'admin-1' } as { id: string } | null,
    isLoadingAuth: false,
    isAdmin: true,
  },
}))

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockAuth.value,
}))

vi.mock('../../../hooks/useDocumentTitle', () => ({
  useDocumentTitle: () => undefined,
}))

vi.mock('../../../features/admin/components/AdminLayout', () => ({
  AdminLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-layout">{children}</div>
  ),
}))

vi.mock('../../../features/admin/components/FeedbackUserInfo', () => ({
  FeedbackUserInfo: ({ userId }: { userId: string }) => (
    <div data-testid="user-info">{userId}</div>
  ),
}))

vi.mock('../../../features/admin/components/FeedbackStatusForm', () => ({
  FeedbackStatusForm: () => <div data-testid="status-form" />,
}))

vi.mock('../../../features/admin/components/FeedbackNoteForm', () => ({
  FeedbackNoteForm: () => <div data-testid="note-form" />,
}))

const getFeedbackMock = vi.hoisted(() => vi.fn())
const getFeedbackImageUrlsMock = vi.hoisted(() => vi.fn())

vi.mock('../../../services/feedbackService', async () => {
  const actual = await vi.importActual<typeof import('../../../services/feedbackService')>(
    '../../../services/feedbackService',
  )
  return {
    ...actual,
    getFeedback: (...args: unknown[]) => getFeedbackMock(...args),
    getFeedbackImageUrls: (...args: unknown[]) => getFeedbackImageUrlsMock(...args),
  }
})

import { AdminFeedbackDetailPage } from '../AdminFeedbackDetailPage'

// ─── Helpers ────────────────────────────────────────────────────

const FEEDBACK_ID = '33333333-3333-3333-3333-333333333333'

const baseFeedback = {
  id: FEEDBACK_ID,
  user_id: '11111111-1111-1111-1111-111111111111',
  category: 'bug',
  status: 'new',
  message: 'テストメッセージ',
  page_url: '/dashboard',
  user_agent: 'Mozilla/5.0',
  admin_note: null,
  image_paths: [],
  created_at: '2026-04-20T12:00:00Z',
  updated_at: '2026-04-20T12:00:00Z',
}

function renderPage(feedbackId = FEEDBACK_ID) {
  return render(
    <MemoryRouter initialEntries={[`/admin/feedback/${feedbackId}`]}>
      <Routes>
        <Route path="/admin/feedback/:id" element={<AdminFeedbackDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

// ─── Tests ──────────────────────────────────────────────────────

afterEach(() => {
  cleanup()
  mockAuth.value = { user: { id: 'admin-1' }, isLoadingAuth: false, isAdmin: true }
})

beforeEach(() => {
  getFeedbackMock.mockReset()
  getFeedbackImageUrlsMock.mockReset()
})

describe('AdminFeedbackDetailPage', () => {
  it('読み込み中はスピナーを表示する', () => {
    getFeedbackMock.mockReturnValue(new Promise(() => {})) // never resolves
    renderPage()
    expect(screen.getByLabelText('読み込み中')).toBeTruthy()
  })

  it('フィードバック詳細を表示する', async () => {
    getFeedbackMock.mockResolvedValue(baseFeedback)
    renderPage()

    expect(await screen.findByText('テストメッセージ')).toBeTruthy()
    expect(screen.getByText('フィードバック詳細')).toBeTruthy()
  })

  it('画像がない場合は画像セクションを表示しない', async () => {
    getFeedbackMock.mockResolvedValue({ ...baseFeedback, image_paths: [] })
    renderPage()

    await screen.findByText('テストメッセージ')
    expect(screen.queryByText(/添付画像/)).toBeNull()
  })

  it('画像がある場合はサムネイルを表示する', async () => {
    getFeedbackMock.mockResolvedValue({
      ...baseFeedback,
      image_paths: ['uid/fid/a.png', 'uid/fid/b.jpg'],
    })
    getFeedbackImageUrlsMock.mockResolvedValue([
      { path: 'uid/fid/a.png', url: 'https://example.com/a.png' },
      { path: 'uid/fid/b.jpg', url: 'https://example.com/b.jpg' },
    ])
    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/添付画像（2枚）/)).toBeTruthy()
    })
    expect(screen.getByAltText('添付画像 1').getAttribute('src')).toBe('https://example.com/a.png')
    expect(screen.getByAltText('添付画像 2').getAttribute('src')).toBe('https://example.com/b.jpg')
  })

  it('サムネイルクリックで Lightbox が開く', async () => {
    getFeedbackMock.mockResolvedValue({
      ...baseFeedback,
      image_paths: ['uid/fid/a.png'],
    })
    getFeedbackImageUrlsMock.mockResolvedValue([
      { path: 'uid/fid/a.png', url: 'https://example.com/a.png' },
    ])
    renderPage()

    const thumb = await screen.findByRole('button', { name: '添付画像 1 を拡大' })
    fireEvent.click(thumb)

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: '画像プレビュー' })).toBeTruthy()
    })
  })

  it('画像 URL 取得失敗でもフィードバック詳細は表示される', async () => {
    getFeedbackMock.mockResolvedValue({
      ...baseFeedback,
      image_paths: ['uid/fid/a.png'],
    })
    getFeedbackImageUrlsMock.mockRejectedValue(new Error('access denied'))
    renderPage()

    expect(await screen.findByText('テストメッセージ')).toBeTruthy()
    expect(screen.queryByText(/添付画像/)).toBeNull()
  })

  it('フィードバックが見つからない場合はメッセージを表示する', async () => {
    getFeedbackMock.mockResolvedValue(null)
    renderPage()

    expect(await screen.findByText('フィードバックが見つかりません')).toBeTruthy()
  })

  it('取得エラーはアラートを表示する', async () => {
    getFeedbackMock.mockRejectedValue(new Error('rls violation'))
    renderPage()

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('rls violation')
  })
})
