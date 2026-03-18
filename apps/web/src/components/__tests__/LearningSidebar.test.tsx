import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LearningSidebar } from '../LearningSidebar'
import type { LearningStepContent } from '@/content/fundamentals/steps'

vi.mock('@/contexts/LearningContext', () => ({
  useLearningContext: () => ({
    completedStepsCount: 1,
    isLoadingStats: false,
  }),
}))

const steps: LearningStepContent[] = [
  {
    id: 'usestate-basic',
    order: 1,
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
  },
  {
    id: 'events',
    order: 2,
    title: 'イベント処理',
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
          id: 'pattern-2',
          prompt: 'challenge',
          requirements: [],
          hints: [],
          expectedKeywords: ['useState'],
          starterCode: 'const [count, setCount] = useState(0);',
        },
      ],
    },
  },
  {
    id: 'conditional',
    order: 3,
    title: '条件分岐',
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
          id: 'pattern-3',
          prompt: 'challenge',
          requirements: [],
          hints: [],
          expectedKeywords: ['useState'],
          starterCode: 'const [count, setCount] = useState(0);',
        },
      ],
    },
  },
]

afterEach(() => {
  cleanup()
})

describe('LearningSidebar', () => {
  it('モバイルではデフォルトで折りたたまれ、トグルで展開できる', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LearningSidebar courseTitle="React基礎" currentStepId="usestate-basic" steps={[...steps]} />
      </MemoryRouter>,
    )

    const toggle = screen.getByRole('button', { name: 'コース一覧を見る' })
    const panel = document.getElementById('learning-sidebar-list')

    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(panel?.className).toContain('max-h-0')

    await user.click(toggle)

    expect(screen.getByRole('button', { name: 'コース一覧を隠す' }).getAttribute('aria-expanded')).toBe('true')
    expect(panel?.className).toContain('max-h-[80vh]')
    expect(screen.getByRole('link', { name: /useState基礎/ }).getAttribute('href')).toBe('/step/usestate-basic')
  })

  it('未解放ステップはロック状態で表示する', () => {
    render(
      <MemoryRouter>
        <LearningSidebar courseTitle="React基礎" currentStepId="events" steps={[...steps]} />
      </MemoryRouter>,
    )

    expect(screen.getAllByText('条件分岐')[0].closest('[aria-disabled="true"]')).toBeTruthy()
  })
})
