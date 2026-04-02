import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BaseNookTopicPage } from '../BaseNookTopicPage'

const getTopicProgressMock = vi.fn()
const getProfileMock = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'tester@example.com',
      user_metadata: {},
    },
    signOut: vi.fn(),
  }),
}))

vi.mock('@/contexts/LearningContext', () => ({
  useLearningContext: () => ({
    completedStepIds: new Set(),
    completedStepsCount: 0,
  }),
}))

vi.mock('@/features/dashboard/components/AppHeader', () => ({
  AppHeader: () => <div>AppHeader stub</div>,
}))

vi.mock('@/features/base-nook/components/ArticleView', () => ({
  ArticleView: () => <div>Article</div>,
}))

vi.mock('@/features/base-nook/components/QuizView', () => ({
  QuizView: () => <div>Quiz</div>,
}))

vi.mock('@/services/baseNookService', () => ({
  getTopicProgress: (...args: unknown[]) => getTopicProgressMock(...args),
  submitAnswer: vi.fn().mockResolvedValue(undefined),
  selectQuestions: () => [],
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

function renderWithRoute(topicId: string) {
  return render(
    <MemoryRouter initialEntries={[`/base-nook/${topicId}`]}>
      <Routes>
        <Route path="/base-nook/:topicId" element={<BaseNookTopicPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('BaseNookTopicPage', () => {
  beforeEach(() => {
    getTopicProgressMock.mockReset()
    getProfileMock.mockReset()
    getTopicProgressMock.mockResolvedValue(new Set())
    getProfileMock.mockResolvedValue({ display_name: 'Coden User' })
  })

  afterEach(() => cleanup())

  it('存在しない topicId で「トピックが見つかりません」が表示されること', () => {
    renderWithRoute('nonexistent')
    expect(screen.getByText('トピックが見つかりません')).toBeTruthy()
  })

  it('読み込み完了後に ArticleView と QuizView がレンダリングされること', async () => {
    renderWithRoute('javascript')
    expect(await screen.findByText('Article')).toBeTruthy()
    expect(screen.getByText('Quiz')).toBeTruthy()
  })

  it('エラー時にエラーメッセージが role="alert" で表示されること', async () => {
    getTopicProgressMock.mockRejectedValue(new Error('進捗の取得に失敗しました'))
    renderWithRoute('javascript')
    const alert = await screen.findByRole('alert')
    expect(alert).toBeTruthy()
    expect(alert.textContent).toContain('進捗の取得に失敗しました')
  })
})
