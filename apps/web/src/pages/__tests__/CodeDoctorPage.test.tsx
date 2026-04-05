import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CodeDoctorPage } from '../CodeDoctorPage'

afterEach(() => {
  cleanup()
})

const getProblemProgressMapMock = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@example.com' },
    signOut: vi.fn(),
  }),
}))

vi.mock('@/services/codeDoctorService', () => ({
  getProblemProgressMap: (...args: unknown[]) => getProblemProgressMapMock(...args),
  submitDoctorSolution: vi.fn(),
}))

vi.mock('@/components/PracticePageLayout', () => ({
  PracticePageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/features/daily/components/PracticeModeNav', () => ({
  PracticeModeNav: () => <nav>PracticeModeNav</nav>,
}))

vi.mock('@/components/CodeEditor', () => ({
  CodeEditor: () => <div>CodeEditor</div>,
}))

vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}))

describe('CodeDoctorPage', () => {
  beforeEach(() => {
    getProblemProgressMapMock.mockReset()
    getProblemProgressMapMock.mockResolvedValue(new Map())
  })

  it('一覧ビューのタイトルが表示される', async () => {
    render(
      <MemoryRouter>
        <CodeDoctorPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('コードドクター')).toBeTruthy()
    expect(screen.getByText('全て')).toBeTruthy()
  })

  it('問題カードが表示される', async () => {
    render(
      <MemoryRouter>
        <CodeDoctorPage />
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
        <CodeDoctorPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('PracticeModeNav')).toBeTruthy()
  })

  it('データ取得エラー時にエラーメッセージが表示される', async () => {
    getProblemProgressMapMock.mockRejectedValue(new Error('取得失敗'))

    render(
      <MemoryRouter>
        <CodeDoctorPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('取得失敗')).toBeTruthy()
  })
})
