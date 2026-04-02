import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MiniProjectsPage } from '../MiniProjectsPage'

afterEach(() => {
  cleanup()
})

const getProjectProgressMapMock = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@example.com' },
    signOut: vi.fn(),
  }),
}))

vi.mock('@/services/miniProjectService', () => ({
  getProjectProgressMap: (...args: unknown[]) => getProjectProgressMapMock(...args),
}))

vi.mock('@/components/PracticePageLayout', () => ({
  PracticePageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/features/daily/components/PracticeModeNav', () => ({
  PracticeModeNav: () => <nav>PracticeModeNav</nav>,
}))

describe('MiniProjectsPage', () => {
  beforeEach(() => {
    getProjectProgressMapMock.mockReset()
    getProjectProgressMapMock.mockResolvedValue(new Map())
  })

  it('一覧ビューのタイトルが表示される', async () => {
    render(
      <MemoryRouter>
        <MiniProjectsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('ミニプロジェクト')).toBeTruthy()
    expect(screen.getByText('全て')).toBeTruthy()
  })

  it('プロジェクトカードが表示される', async () => {
    render(
      <MemoryRouter>
        <MiniProjectsPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      // フィルタ4つ + プロジェクトカード群
      expect(buttons.length).toBeGreaterThan(4)
    })
  })

  it('PracticeModeNavが表示される', async () => {
    render(
      <MemoryRouter>
        <MiniProjectsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('PracticeModeNav')).toBeTruthy()
  })

  it('データ取得エラー時にエラーメッセージが表示される', async () => {
    getProjectProgressMapMock.mockRejectedValue(new Error('データ取得エラー'))

    render(
      <MemoryRouter>
        <MiniProjectsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('データ取得エラー')).toBeTruthy()
  })
})
