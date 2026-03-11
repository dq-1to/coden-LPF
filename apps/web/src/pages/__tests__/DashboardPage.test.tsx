import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardPage } from '../DashboardPage'
import { addToReviewList, clearReviewList } from '@/services/reviewListService'

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
    completedStepsCount: 3,
  }),
}))

vi.mock('@/features/dashboard/components/AppHeader', () => ({
  AppHeader: ({ displayName }: { displayName: string }) => <div>{displayName} header</div>,
}))

vi.mock('@/features/dashboard/components/DashboardSidebar', () => ({
  DashboardSidebar: () => <aside>sidebar</aside>,
}))

vi.mock('@/features/dashboard/components/LearningOverviewCard', () => ({
  LearningOverviewCard: ({ completedCount }: { completedCount: number }) => <div>overview {completedCount}</div>,
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
    clearReviewList()
    getProfileMock.mockReset()
    getProfileMock.mockResolvedValue({
      display_name: 'Coden User',
    })
  })

  it('復習リストをダッシュボード導線上に表示する', async () => {
    addToReviewList('usestate-basic')

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('復習リスト')).toBeTruthy()
    expect(screen.getByText('このリストは現在の端末とブラウザにのみ保存されます。')).toBeTruthy()
    expect(screen.getByRole('link', { name: /useState基礎/i }).getAttribute('href')).toBe('/step/usestate-basic')
    expect(getProfileMock).toHaveBeenCalledWith('user-1')
  })
})
