import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardPage } from '../DashboardPage'

const getProfileMock = vi.fn()

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
  useLearningContext: () => ({
    completedStepIds: new Set(['usestate-basic', 'events', 'conditional']),
    completedStepsCount: 3,
  }),
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
  getProfile: (...args: unknown[]) => getProfileMock(...args),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabaseConfigError: null,
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    getProfileMock.mockReset()
    getProfileMock.mockResolvedValue({
      display_name: 'Coden User',
    })
  })

  it('カテゴリカードとスキルアップセクションが表示される', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('学習コース')).toBeTruthy()
    expect(screen.getByText('React')).toBeTruthy()
    expect(screen.getByText('TypeScript')).toBeTruthy()
    expect(screen.getByText('スキルアップ')).toBeTruthy()
    expect(screen.getByText('デイリーチャレンジ')).toBeTruthy()
    expect(getProfileMock).toHaveBeenCalledWith('user-1')
  })
})
