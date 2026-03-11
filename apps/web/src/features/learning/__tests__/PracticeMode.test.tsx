import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PracticeMode } from '../PracticeMode'
import type { PracticeQuestion } from '../../../content/fundamentals/steps'

const addToReviewList = vi.fn()
const removeFromReviewList = vi.fn()

vi.mock('../../../services/reviewListService', () => ({
  addToReviewList: (...args: unknown[]) => addToReviewList(...args),
  removeFromReviewList: (...args: unknown[]) => removeFromReviewList(...args),
}))

const firstQuestions: PracticeQuestion[] = [
  {
    id: 'q1',
    prompt: '最初の質問',
    answer: 'React',
    hint: 'ヒント1',
    explanation: '解説1',
  },
]

const secondQuestions: PracticeQuestion[] = [
  {
    id: 'q2',
    prompt: '次の質問',
    answer: 'TypeScript',
    hint: 'ヒント2',
    explanation: '解説2',
  },
]

describe('PracticeMode', () => {
  beforeEach(() => {
    addToReviewList.mockReset()
    removeFromReviewList.mockReset()
  })

  it('stepId が変わると回答・ヒント・判定状態をリセットする', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const { rerender } = render(<PracticeMode stepId="step-a" questions={firstQuestions} onComplete={onComplete} />)

    await user.type(screen.getByLabelText('Q1 回答欄'), 'React')
    await user.click(screen.getByRole('button', { name: 'ヒントを表示' }))
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(removeFromReviewList).toHaveBeenCalledWith('step-a')
    expect(screen.getByRole('status').textContent).toContain('Practiceを完了しました')
    expect(screen.getByText('ヒント1')).toBeTruthy()

    rerender(<PracticeMode stepId="step-b" questions={secondQuestions} onComplete={onComplete} />)

    expect((screen.getByLabelText('Q1 回答欄') as HTMLInputElement).value).toBe('')
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.queryByText('ヒント1')).toBeNull()
    expect(screen.getByText('Q1. 次の質問')).toBeTruthy()
  })
})
