import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TestMode } from '../TestMode'
import { getAllCourses, findCategoryByStepId } from '../../../content/courseData'
import type { TestTask } from '../../../content/fundamentals/steps'
import { previewByStepId } from '../testModePreview'

const recordWrongAnswer = vi.fn()
const resolveReviewItem = vi.fn()
const trackLearningEvent = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '00000000-0000-0000-0000-000000000001' },
  }),
}))

vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}))

vi.mock('prismjs', () => ({
  default: {
    highlight: (code: string) => code,
    languages: { tsx: {}, javascript: {} },
  },
}))
vi.mock('prismjs/components/prism-markup', () => ({}))
vi.mock('prismjs/components/prism-jsx', () => ({}))
vi.mock('prismjs/components/prism-typescript', () => ({}))
vi.mock('prismjs/components/prism-tsx', () => ({}))

vi.mock('../../../services/reviewService', () => ({
  recordWrongAnswer: (...args: unknown[]) => recordWrongAnswer(...args),
  resolveReviewItem: (...args: unknown[]) => resolveReviewItem(...args),
}))

vi.mock('../../../services/eventService', () => ({
  trackLearningEvent: (...args: unknown[]) => trackLearningEvent(...args),
}))

const firstTask: TestTask = {
  instruction: '最初の問題',
  starterCode: 'const [count, setCount] = useState(0)\n____',
  expectedKeywords: ['setCount', 'count - 1'],
  explanation: '解説1',
}

const secondTask: TestTask = {
  instruction: '次の問題',
  starterCode: '<input value={name} ____={(e) => setName(e.target.value)} />',
  expectedKeywords: ['onChange'],
  explanation: '解説2',
}

describe('TestMode', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    recordWrongAnswer.mockReset()
    resolveReviewItem.mockReset()
    trackLearningEvent.mockReset()
    recordWrongAnswer.mockResolvedValue(undefined)
    resolveReviewItem.mockResolvedValue(undefined)
  })

  it('stepId が変わると入力内容と判定状態をリセットする', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const { rerender } = render(<TestMode stepId="step-a" task={firstTask} onComplete={onComplete} />)

    const input = screen.getByLabelText('コードの空欄を入力')
    await user.type(input, 'setCount(count - 1)')
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(trackLearningEvent).toHaveBeenCalledWith({
      userId: '00000000-0000-0000-0000-000000000001',
      eventType: 'test_submitted',
      stepId: 'step-a',
      mode: 'test',
      courseId: null,
      payload: {
        isCorrect: true,
        itemCount: 1,
        questionIds: ['test'],
      },
    })
    expect(resolveReviewItem).toHaveBeenCalledWith({
      userId: '00000000-0000-0000-0000-000000000001',
      stepId: 'step-a',
      mode: 'test',
      questionId: 'test',
    })
    expect(screen.getByRole('status').textContent).toContain('テスト合格')
    expect(screen.getByRole('status').className).toContain('animate-fadeIn')

    rerender(<TestMode stepId="step-b" task={secondTask} onComplete={onComplete} />)

    expect((screen.getByLabelText('コードの空欄を入力') as HTMLInputElement).value).toBe('')
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByText('次の問題')).toBeTruthy()
  })

  it('実装済み全ステップにプレビュー定義が存在する', () => {
    // TypeScript ステップ・react-modern ステップは概念学習のため React プレビュー不要
    const reactStepIds = getAllCourses().flatMap((course) => course.steps)
      .filter((step) => step.isImplemented && findCategoryByStepId(step.id)?.id === 'react' && step.order <= 20)
      .map((step) => step.id)

    expect(reactStepIds).toHaveLength(20)

    for (const stepId of reactStepIds) {
      expect(previewByStepId[stepId]).toBeTruthy()
      expect(previewByStepId[stepId]!.title.length).toBeGreaterThan(0)
      expect(previewByStepId[stepId]!.description.length).toBeGreaterThan(0)
    }
  })

  it('新規追加したステップでも合格時にプレビューを表示する', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()

    render(<TestMode stepId="useeffect" task={firstTask} onComplete={onComplete} />)

    await user.type(screen.getByLabelText('コードの空欄を入力'), 'setCount(count - 1)')
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(screen.getByText('Effect Sync Preview')).toBeTruthy()
    expect(
      screen.getByText('副作用で取得したデータや保存状態が、画面に同期される流れを確認できます。'),
    ).toBeTruthy()
  })
})

describe('TestMode 不正解フィードバック', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    recordWrongAnswer.mockReset()
    resolveReviewItem.mockReset()
    trackLearningEvent.mockReset()
    recordWrongAnswer.mockResolvedValue(undefined)
    resolveReviewItem.mockResolvedValue(undefined)
  })

  it('conditions がある場合、不正解時に不足条件を日本語ラベル・説明で表示する', async () => {
    const user = userEvent.setup()
    const conditionTask: TestTask = {
      instruction: '条件付き問題',
      starterCode: 'const x = ____',
      expectedKeywords: ['setName'],
      conditions: [
        {
          id: 'c-update',
          label: '状態を更新する',
          requiredKeywords: ['setName'],
          explanation: 'setNameで名前を更新しましょう',
        },
      ],
    }

    render(<TestMode stepId="step-cond" task={conditionTask} onComplete={vi.fn()} />)

    await user.type(screen.getByLabelText('コードの空欄を入力'), 'foo')
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(screen.getByText('以下の条件を満たせているか確認しましょう:')).toBeTruthy()
    expect(screen.getByText('状態を更新する')).toBeTruthy()
    expect(screen.getByText(/setNameで名前を更新しましょう/)).toBeTruthy()
  })

  it('solutionCode がある場合、「解答例を見る」で解答例を表示できる', async () => {
    const user = userEvent.setup()
    const solutionTask: TestTask = {
      instruction: '解答例つき問題',
      starterCode: 'const x = ____',
      expectedKeywords: ['setName'],
      solutionCode: 'const [name, setName] = useState("")',
    }

    render(<TestMode stepId="step-sol" task={solutionTask} onComplete={vi.fn()} />)

    await user.type(screen.getByLabelText('コードの空欄を入力'), 'foo')
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(screen.queryByText('const [name, setName] = useState("")')).toBeNull()
    await user.click(screen.getByRole('button', { name: '解答例を見る' }))
    expect(screen.getByText('const [name, setName] = useState("")')).toBeTruthy()
  })

  it('conditions が無い場合は従来どおり explanation を表示する（後方互換）', async () => {
    const user = userEvent.setup()

    render(<TestMode stepId="step-a" task={firstTask} onComplete={vi.fn()} />)

    await user.type(screen.getByLabelText('コードの空欄を入力'), 'foo')
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(screen.getByText('解説1')).toBeTruthy()
    expect(screen.queryByText('以下の条件を満たせているか確認しましょう:')).toBeNull()
  })
})
