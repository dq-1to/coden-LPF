import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BaseNookPage } from '../BaseNookPage'

const getAllProgressMock = vi.fn()
const getProfileMock = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'tester@example.com' },
    signOut: vi.fn(),
  }),
}))

vi.mock('@/contexts/LearningContext', () => ({
  useLearningContext: () => ({
    completedStepIds: new Set<string>(),
    completedStepsCount: 0,
  }),
}))

vi.mock('@/features/dashboard/components/AppHeader', () => ({
  AppHeader: () => <div>app-header-stub</div>,
}))

vi.mock('@/features/base-nook/components/TopicCard', () => ({
  TopicCard: ({ topic }: { topic: { title: string } }) => (
    <div data-testid="topic-card">{topic.title}</div>
  ),
}))

vi.mock('@/services/baseNookService', () => ({
  getAllProgress: (...args: unknown[]) => getAllProgressMock(...args),
}))

vi.mock('@/services/profileService', () => ({
  getProfile: (...args: unknown[]) => getProfileMock(...args),
}))

vi.mock('@/hooks/useDocumentTitle', () => ({
  useDocumentTitle: () => undefined,
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabaseConfigError: null,
}))

describe('BaseNookPage', () => {
  beforeEach(() => {
    getAllProgressMock.mockReset()
    getProfileMock.mockReset()
    getProfileMock.mockResolvedValue({ display_name: 'Test User' })
  })

  afterEach(() => cleanup())

  it('読み込み中にスピナー（animate-spin）が表示されること', () => {
    // getAllProgress を pending のままにして isLoading=true の状態を維持する
    getAllProgressMock.mockReturnValue(new Promise(() => {}))

    render(
      <MemoryRouter>
        <BaseNookPage />
      </MemoryRouter>,
    )

    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeTruthy()
  })

  it('1ページ目にトピックカードが9件表示されること（12件中）', async () => {
    getAllProgressMock.mockResolvedValue([])

    render(
      <MemoryRouter>
        <BaseNookPage />
      </MemoryRouter>,
    )

    // Pagination により1ページ目は最大9件表示
    const cards = await screen.findAllByTestId('topic-card')
    expect(cards).toHaveLength(9)
  })

  it('エラー時にエラーメッセージが role="alert" で表示されること', async () => {
    getAllProgressMock.mockRejectedValue(new Error('進捗の取得に失敗しました'))

    render(
      <MemoryRouter>
        <BaseNookPage />
      </MemoryRouter>,
    )

    const alert = await screen.findByRole('alert')
    expect(alert).toBeTruthy()
    expect(alert.textContent).toContain('進捗の取得に失敗しました')
  })
})
