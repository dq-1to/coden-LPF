import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DailyChallengePage } from '../DailyChallengePage'

afterEach(() => {
  cleanup()
})

const getTodayChallengeMock = vi.fn()
const getWeeklyStatusMock = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@example.com' },
    signOut: vi.fn(),
  }),
}))

vi.mock('@/contexts/LearningContext', () => ({
  useLearningContext: () => ({
    completedStepIds: new Set(['usestate-basic', 'events']),
    completedStepsCount: 2,
    isLoadingStats: false,
  }),
}))

vi.mock('@/services/dailyChallengeService', () => ({
  getTodayChallenge: (...args: unknown[]) => getTodayChallengeMock(...args),
  submitDailyAnswer: vi.fn(),
  getWeeklyStatus: (...args: unknown[]) => getWeeklyStatusMock(...args),
  getTodayJst: () => '2026-04-02',
}))

vi.mock('@/components/PracticePageLayout', () => ({
  PracticePageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/features/daily/components/PracticeModeNav', () => ({
  PracticeModeNav: () => <nav>PracticeModeNav</nav>,
}))

vi.mock('@/features/daily/components/WeeklyStatus', () => ({
  WeeklyStatus: () => <div>WeeklyStatus</div>,
}))

vi.mock('@/features/daily/components/DailyChallengeCard', () => ({
  DailyChallengeCard: () => <div>DailyChallengeCard</div>,
}))

vi.mock('@/features/daily/components/CompletedView', () => ({
  CompletedView: () => <div>CompletedView</div>,
}))

describe('DailyChallengePage', () => {
  beforeEach(() => {
    getTodayChallengeMock.mockReset()
    getWeeklyStatusMock.mockReset()
  })

  it('未回答の問題がある場合にDailyChallengeCardが表示される', async () => {
    getTodayChallengeMock.mockResolvedValue({
      question: { id: 'q-1', stepId: 'usestate-basic', type: 'blank', prompt: 'test', answer: 'a', hint: 'h', explanation: 'e' },
      alreadyCompleted: false,
      completedAt: null,
      pointsEarned: 0,
      dateStr: '2026-04-02',
    })
    getWeeklyStatusMock.mockResolvedValue([
      { date: '2026-04-02', completed: false },
    ])

    render(
      <MemoryRouter>
        <DailyChallengePage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('DailyChallengeCard')).toBeTruthy()
    expect(screen.getByText('デイリーチャレンジ')).toBeTruthy()
    expect(screen.getByText('WeeklyStatus')).toBeTruthy()
  })

  it('回答済みの場合にCompletedViewが表示される', async () => {
    getTodayChallengeMock.mockResolvedValue({
      question: null,
      alreadyCompleted: true,
      completedAt: '2026-04-02T10:00:00Z',
      pointsEarned: 20,
      dateStr: '2026-04-02',
    })
    getWeeklyStatusMock.mockResolvedValue([
      { date: '2026-04-02', completed: true },
    ])

    render(
      <MemoryRouter>
        <DailyChallengePage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('CompletedView')).toBeTruthy()
  })

  it('データ取得エラー時にエラーメッセージが表示される', async () => {
    getTodayChallengeMock.mockRejectedValue(new Error('接続エラー'))
    getWeeklyStatusMock.mockRejectedValue(new Error('接続エラー'))

    render(
      <MemoryRouter>
        <DailyChallengePage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('接続エラー')).toBeTruthy()
  })
})
