import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { StepPage } from '../StepPage'

const useChallengeSubmissionMock = vi.fn()
const useRecentChallengeSubmissionsMock = vi.fn()
const useLearningStepMock = vi.fn()

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
    completedStepsCount: 20,
    isLoadingStats: false,
  }),
}))

vi.mock('@/components/LearningSidebar', () => ({
  LearningSidebar: () => <aside>learning sidebar</aside>,
}))

vi.mock('@/features/dashboard/components/AppHeader', () => ({
  AppHeader: ({ displayName }: { displayName: string }) => <div>{displayName} header</div>,
}))

vi.mock('@/features/learning/ReadMode', () => ({
  ReadMode: () => <div>read mode</div>,
}))

vi.mock('@/features/learning/PracticeMode', () => ({
  PracticeMode: () => <div>practice mode</div>,
}))

vi.mock('@/features/learning/TestMode', () => ({
  TestMode: () => <div>test mode</div>,
}))

vi.mock('@/features/learning/ChallengeMode', () => ({
  ChallengeMode: () => <div>challenge mode</div>,
}))

vi.mock('@/features/learning/hooks/useChallengeSubmission', () => ({
  useChallengeSubmission: (...args: unknown[]) => useChallengeSubmissionMock(...args),
}))

vi.mock('@/features/learning/hooks/useRecentChallengeSubmissions', () => ({
  useRecentChallengeSubmissions: (...args: unknown[]) => useRecentChallengeSubmissionsMock(...args),
}))

vi.mock('@/features/learning/hooks/useLearningStep', () => ({
  useLearningStep: (...args: unknown[]) => useLearningStepMock(...args),
}))

function mockLearningStep() {
  useLearningStepMock.mockReturnValue({
    step: {
      id: 'usestate-basic',
      title: 'useState基礎',
      summary: 'summary',
      readMarkdown: '# read',
      practiceQuestions: [],
      testTask: {
        instruction: 'instruction',
        starterCode: 'const value = ____;',
        expectedKeywords: ['value'],
      },
      challengeTask: {
        patterns: [
          {
            id: 'pattern-1',
            prompt: 'challenge',
            requirements: [],
            hints: [],
            expectedKeywords: ['useState'],
            starterCode: 'const [count, setCount] = useState(0);',
          },
        ],
      },
      order: 1,
    },
    isUnavailableStep: false,
    modeStatus: {
      read: false,
      practice: false,
      test: false,
      challenge: false,
    },
    syncMessage: null,
    toastMessage: null,
    nextStep: undefined,
    sidebarTitle: 'React基礎',
    sidebarSteps: [],
    isStepCompleted: false,
    handleModeComplete: vi.fn(),
  })
}

describe('StepPage', () => {
  it('モード切り替え時に説明カードが切り替わる', async () => {
    const user = userEvent.setup()

    useChallengeSubmissionMock.mockReturnValue(vi.fn())
    useRecentChallengeSubmissionsMock.mockReturnValue({
      submissions: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    })
    mockLearningStep()

    render(
      <MemoryRouter initialEntries={['/step/usestate-basic']}>
        <Routes>
          <Route path="/step/:stepId" element={<StepPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Read', level: 2 })).toBeTruthy()
    expect(screen.getByText('読んで理解しよう')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Practice' }))

    expect(screen.getByRole('heading', { name: 'Practice', level: 2 })).toBeTruthy()
    expect(screen.getByText('手を動かして定着させよう')).toBeTruthy()
  })

  it('Challenge タブで提出履歴を主要導線上に表示する', async () => {
    const user = userEvent.setup()

    useChallengeSubmissionMock.mockReturnValue(vi.fn())
    useRecentChallengeSubmissionsMock.mockReturnValue({
      submissions: [
        {
          id: 'submission-1',
          user_id: 'user-1',
          step_id: 'usestate-basic',
          code: 'const [count, setCount] = useState(0);',
          is_passed: true,
          matched_keywords: ['useState'],
          submitted_at: '2026-03-09T10:30:00.000Z',
        },
      ],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    })
    mockLearningStep()

    render(
      <MemoryRouter initialEntries={['/step/usestate-basic']}>
        <Routes>
          <Route path="/step/:stepId" element={<StepPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getAllByRole('button', { name: 'Challenge' })[0])

    expect(screen.getByText('直近の提出履歴')).toBeTruthy()
    expect(screen.getByText('Latest Submission')).toBeTruthy()
    expect(screen.getByText('合格')).toBeTruthy()
    expect(screen.getByText('const [count, setCount] = useState(0);')).toBeTruthy()
  })
})
