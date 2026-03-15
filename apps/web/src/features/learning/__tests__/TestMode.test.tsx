import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TestMode } from '../TestMode'
import { COURSES } from '../../../content/courseData'
import type { TestTask } from '../../../content/fundamentals/steps'
import { previewByStepId } from '../testModePreview'

const addToReviewList = vi.fn()
const removeFromReviewList = vi.fn()

vi.mock('../../../services/reviewListService', () => ({
  addToReviewList: (...args: unknown[]) => addToReviewList(...args),
  removeFromReviewList: (...args: unknown[]) => removeFromReviewList(...args),
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
    addToReviewList.mockReset()
    removeFromReviewList.mockReset()
  })

  it('stepId が変わると入力内容と判定状態をリセットする', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const { rerender } = render(<TestMode stepId="step-a" task={firstTask} onComplete={onComplete} />)

    const input = screen.getByLabelText('コードの空欄を入力')
    await user.type(input, 'setCount(count - 1)')
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(removeFromReviewList).toHaveBeenCalledWith('step-a')
    expect(screen.getByRole('status').textContent).toContain('テスト合格')

    rerender(<TestMode stepId="step-b" task={secondTask} onComplete={onComplete} />)

    expect((screen.getByLabelText('コードの空欄を入力') as HTMLInputElement).value).toBe('')
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByText('次の問題')).toBeTruthy()
  })

  it('実装済み全ステップにプレビュー定義が存在する', () => {
    const implementedStepIds = COURSES.flatMap((course) => course.steps)
      .filter((step) => step.isImplemented)
      .map((step) => step.id)

    expect(implementedStepIds).toHaveLength(20)

    for (const stepId of implementedStepIds) {
      expect(previewByStepId[stepId]).toBeTruthy()
      expect(previewByStepId[stepId].title.length).toBeGreaterThan(0)
      expect(previewByStepId[stepId].description.length).toBeGreaterThan(0)
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
