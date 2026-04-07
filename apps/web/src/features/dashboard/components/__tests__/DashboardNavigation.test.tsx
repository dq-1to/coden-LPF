import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
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

afterEach(() => {
  cleanup()
})

describe('AppHeader ナビゲーション', () => {
  it('カリキュラムドロップダウンからカテゴリリンクへ遷移できる', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AppHeader displayName="tester" onSignOut={() => undefined} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /カリキュラム/ }))

    const reactLink = screen.getByRole('menuitem', { name: 'React' })
    expect(reactLink.getAttribute('href')).toBe('/curriculum#react')
  })

  it('ドロップダウンに練習モードリンクが含まれる', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AppHeader displayName="tester" onSignOut={() => undefined} />
      </MemoryRouter>,
    )

    const nav = screen.getByRole('navigation', { name: 'メインナビゲーション' })
    await user.click(within(nav).getByRole('button', { name: /カリキュラム/ }))

    expect(screen.getByRole('menuitem', { name: 'デイリーチャレンジ' }).getAttribute('href')).toBe('/daily')
    expect(screen.getByRole('menuitem', { name: 'コードドクター' }).getAttribute('href')).toBe('/practice/code-doctor')
  })
})
