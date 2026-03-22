import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppHeader } from '../AppHeader'

vi.mock('@/contexts/LearningContext', () => ({
  useLearningContext: () => ({
    stats: {
      total_points: 120,
      current_streak: 3,
    },
  }),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
  }),
}))

vi.mock('@/services/statsService', () => ({
  calculatePointGoalProgress: () => ({
    current: 120,
    target: 200,
    percent: 60,
  }),
  countMonthlyStudyDays: () => 0,
  getLearningHeatmap: vi.fn().mockResolvedValue([]),
}))

describe('dashboard navigation placeholders', () => {
  it('AppHeader の学習導線が最初の実装済みステップを指す', () => {
    render(
      <MemoryRouter>
        <AppHeader displayName="tester" onSignOut={() => undefined} />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: '学習を始める' })
    expect(link.getAttribute('href')).toBe('/step/usestate-basic')
  })

})
