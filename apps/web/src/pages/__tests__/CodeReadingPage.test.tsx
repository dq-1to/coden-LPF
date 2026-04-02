import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CodeReadingPage } from '../CodeReadingPage'

afterEach(() => {
  cleanup()
})

const getReadingProgressMapMock = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@example.com' },
    signOut: vi.fn(),
  }),
}))

vi.mock('@/services/codeReadingService', () => ({
  getReadingProgressMap: (...args: unknown[]) => getReadingProgressMapMock(...args),
  judgeAnswer: vi.fn().mockReturnValue(true),
  submitReading: vi.fn(),
}))

vi.mock('@/components/PracticePageLayout', () => ({
  PracticePageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/features/daily/components/PracticeModeNav', () => ({
  PracticeModeNav: () => <nav>PracticeModeNav</nav>,
}))

describe('CodeReadingPage', () => {
  beforeEach(() => {
    getReadingProgressMapMock.mockReset()
    getReadingProgressMapMock.mockResolvedValue(new Map())
  })

  it('一覧ビューのタイトルが表示される', async () => {
    render(
      <MemoryRouter>
        <CodeReadingPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('コードリーディング')).toBeTruthy()
    expect(screen.getByText('全て')).toBeTruthy()
  })

  it('問題カードが表示される', async () => {
    render(
      <MemoryRouter>
        <CodeReadingPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      // フィルタ4つ + 問題カード群
      expect(buttons.length).toBeGreaterThan(4)
    })
  })

  it('PracticeModeNavが表示される', async () => {
    render(
      <MemoryRouter>
        <CodeReadingPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('PracticeModeNav')).toBeTruthy()
  })

  it('データ取得エラー時にエラーメッセージが表示される', async () => {
    getReadingProgressMapMock.mockRejectedValue(new Error('読み込み失敗'))

    render(
      <MemoryRouter>
        <CodeReadingPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('読み込み失敗')).toBeTruthy()
  })
})
