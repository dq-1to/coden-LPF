import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LearningSidebar } from '../LearningSidebar'
import type { CategoryMeta } from '@/content/courseData'

vi.mock('@/contexts/LearningContext', () => ({
  useLearningContext: () => ({
    completedStepIds: new Set(['usestate-basic']),
    isLoadingStats: false,
  }),
}))

const testCategory: CategoryMeta = {
  id: 'react',
  title: 'React',
  description: 'React学習',
  icon: 'Atom',
  courses: [
    {
      id: 'react-fundamentals',
      title: 'React基礎',
      level: 'beginner',
      requiredPrerequisites: [],
      recommendedPrerequisites: [],
      steps: [
        { id: 'usestate-basic', order: 1, title: 'useState基礎', description: '', isImplemented: true },
        { id: 'events', order: 2, title: 'イベント処理', description: '', isImplemented: true },
        { id: 'conditional', order: 3, title: '条件分岐', description: '', isImplemented: true },
      ],
    },
    {
      id: 'react-hooks',
      title: 'React応用',
      level: 'intermediate',
      requiredPrerequisites: ['react-fundamentals'],
      recommendedPrerequisites: [],
      steps: [
        { id: 'useeffect', order: 5, title: 'useEffect', description: '', isImplemented: true },
      ],
    },
  ],
}

afterEach(() => {
  cleanup()
})

describe('LearningSidebar', () => {
  it('モバイルではデフォルトで折りたたまれ、トグルで展開できる', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LearningSidebar category={testCategory} currentStepId="usestate-basic" />
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

  it('カテゴリ内の複数コースがアコーディオン表示される', () => {
    render(
      <MemoryRouter>
        <LearningSidebar category={testCategory} currentStepId="usestate-basic" />
      </MemoryRouter>,
    )

    // 現在のコースのアコーディオンは開いている
    expect(screen.getByText('React基礎')).toBeTruthy()
    expect(screen.getByRole('link', { name: /useState基礎/ })).toBeTruthy()

    // 必須前提未完了のコースはロック表示
    expect(screen.getByText('React応用')).toBeTruthy()
  })
})
