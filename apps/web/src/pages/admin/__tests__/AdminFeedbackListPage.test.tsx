import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const listFeedbackMock = vi.hoisted(() => vi.fn())

vi.mock('../../../services/feedbackService', async () => {
  const actual = await vi.importActual<typeof import('../../../services/feedbackService')>(
    '../../../services/feedbackService',
  )
  return {
    ...actual,
    listFeedback: (...args: unknown[]) => listFeedbackMock(...args),
  }
})

// AdminLayout は useGreetingName/useSignOut/AppHeader 等を連鎖的に使うため、簡易モックに差し替える
vi.mock('../../../features/admin/components/AdminLayout', () => ({
  AdminLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}))

vi.mock('../../../hooks/useDocumentTitle', () => ({
  useDocumentTitle: () => undefined,
}))

import { AdminFeedbackListPage } from '../AdminFeedbackListPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminFeedbackListPage />
    </MemoryRouter>,
  )
}

const SAMPLE = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    user_id: 'uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu',
    category: 'bug',
    message: 'バグ発見',
    page_url: '/x',
    user_agent: null,
    status: 'new',
    admin_note: null,
    created_at: '2026-04-17T00:00:00Z',
    updated_at: '2026-04-17T00:00:00Z',
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    user_id: 'uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu',
    category: 'request',
    message: '機能追加希望',
    page_url: null,
    user_agent: null,
    status: 'resolved',
    admin_note: null,
    created_at: '2026-04-16T00:00:00Z',
    updated_at: '2026-04-16T00:00:00Z',
  },
]

describe('AdminFeedbackListPage', () => {
  beforeEach(() => {
    listFeedbackMock.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('マウント時にフィルタなしで listFeedback を呼ぶ', async () => {
    listFeedbackMock.mockResolvedValue([])
    renderPage()
    await waitFor(() => {
      expect(listFeedbackMock).toHaveBeenCalledWith({})
    })
  })

  it('一覧を表示し /admin/feedback/:id へのリンクを持つ', async () => {
    listFeedbackMock.mockResolvedValue(SAMPLE)
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('バグ発見')).toBeTruthy()
    })

    const links = screen.getAllByRole('link')
    const hrefs = links.map((a) => a.getAttribute('href'))
    expect(hrefs).toContain(`/admin/feedback/${SAMPLE[0]?.id}`)
    expect(hrefs).toContain(`/admin/feedback/${SAMPLE[1]?.id}`)
  })

  it('空のときは空状態メッセージを表示する', async () => {
    listFeedbackMock.mockResolvedValue([])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('該当するフィードバックはありません')).toBeTruthy()
    })
  })

  it('カテゴリ/ステータスを変更すると listFeedback が再呼び出しされる', async () => {
    listFeedbackMock.mockResolvedValue([])
    renderPage()

    await waitFor(() => {
      expect(listFeedbackMock).toHaveBeenCalledTimes(1)
    })

    fireEvent.change(screen.getByLabelText('カテゴリ'), { target: { value: 'bug' } })
    fireEvent.change(screen.getByLabelText('ステータス'), { target: { value: 'resolved' } })

    await waitFor(() => {
      expect(listFeedbackMock).toHaveBeenLastCalledWith({ category: 'bug', status: 'resolved' })
    })
  })

  it('fetch エラーは alert で表示する', async () => {
    listFeedbackMock.mockRejectedValue(new Error('rls violation'))
    renderPage()
    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText('rls violation')).toBeTruthy()
  })
})
