import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardPage } from '../DashboardPage'

const testState = vi.hoisted(() => ({
  getProfileMock: vi.fn(),
  learningContext: {
    allStepProgress: [
      {
        user_id: 'user-1',
        step_id: 'usestate-basic',
        read_done: true,
        practice_done: true,
        test_done: true,
        challenge_done: true,
        updated_at: '2026-06-03T00:00:00Z',
        completed_at: '2026-06-03T00:00:00Z',
      },
      {
        user_id: 'user-1',
        step_id: 'events',
        read_done: true,
        practice_done: false,
        test_done: false,
        challenge_done: false,
        updated_at: '2026-06-03T00:00:00Z',
        completed_at: null,
      },
    ],
    completedStepIds: new Set(['usestate-basic', 'events', 'conditional']),
    completedStepsCount: 3,
  },
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'tester@example.com',
    },
    signOut: vi.fn(),
  }),
}))

vi.mock('@/contexts/LearningContext', () => ({
  useLearningContext: () => testState.learningContext,
}))

vi.mock('@/features/dashboard/components/AppHeader', () => ({
  AppHeader: ({ displayName }: { displayName: string }) => <div>{displayName} header</div>,
}))

vi.mock('@/features/dashboard/components/DashboardSidebar', () => ({
  DashboardSidebar: () => <aside>sidebar</aside>,
}))

vi.mock('@/features/dashboard/components/WelcomeBanner', () => ({
  WelcomeBanner: ({ displayName }: { displayName: string }) => <div>Welcome {displayName}</div>,
}))

vi.mock('@/services/profileService', () => ({
  getProfile: (...args: unknown[]) => testState.getProfileMock(...args),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabaseConfigError: null,
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    testState.getProfileMock.mockReset()
    testState.getProfileMock.mockResolvedValue({
      display_name: 'Coden User',
    })
    testState.learningContext = {
      allStepProgress: [
        {
          user_id: 'user-1',
          step_id: 'usestate-basic',
          read_done: true,
          practice_done: true,
          test_done: true,
          challenge_done: true,
          updated_at: '2026-06-03T00:00:00Z',
          completed_at: '2026-06-03T00:00:00Z',
        },
        {
          user_id: 'user-1',
          step_id: 'events',
          read_done: true,
          practice_done: false,
          test_done: false,
          challenge_done: false,
          updated_at: '2026-06-03T00:00:00Z',
          completed_at: null,
        },
      ],
      completedStepIds: new Set(['usestate-basic', 'events', 'conditional']),
      completedStepsCount: 3,
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('カテゴリカードとスキルアップセクションが表示される', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('学習コース')).toBeTruthy()
    expect(screen.getByText('今日のおすすめ')).toBeTruthy()
    expect(screen.getByText('Step 2 の Practice から再開')).toBeTruthy()
    expect(screen.getByText('React')).toBeTruthy()
    expect(screen.getByText('TypeScript')).toBeTruthy()
    expect(screen.getByText('スキルアップ')).toBeTruthy()
    expect(screen.getByText('デイリーチャレンジ')).toBeTruthy()
    expect(screen.getAllByText('昨日の復習').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('基礎の補習')).toBeTruthy()
    expect(screen.getByText('バグ修正')).toBeTruthy()
    expect(screen.getByText('成果物作成')).toBeTruthy()
    expect(screen.getByText('コードを読む')).toBeTruthy()
    expect(screen.queryByText('はじめての方へ')).toBeNull()
    expect(testState.getProfileMock).toHaveBeenCalledWith('user-1')
  })

  it('未着手でオンボーディング未完了の場合は初回カードを表示する', async () => {
    testState.learningContext = {
      allStepProgress: [],
      completedStepIds: new Set<string>(),
      completedStepsCount: 0,
    }

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('学習コース')).toBeTruthy()
    expect(screen.getByText('はじめての方へ')).toBeTruthy()
    expect(screen.getByText('4つの流れで1ステップずつ進めます')).toBeTruthy()
    expect(screen.getByRole('link', { name: '始める' }).getAttribute('href')).toBe('/step/usestate-basic')
  })
})
