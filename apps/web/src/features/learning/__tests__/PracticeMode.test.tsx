import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

const choiceQuestions: PracticeQuestion[] = [
  {
    id: 'q-choice',
    prompt: '選択式の質問',
    answer: '正解の選択肢',
    hint: 'ヒント選択',
    explanation: '解説選択',
    choices: ['不正解A', '正解の選択肢', '不正解B', '不正解C'],
  },
]

describe('PracticeMode', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    addToReviewList.mockReset()
    removeFromReviewList.mockReset()
  })

  it('choices がある問題は選択ボタンを表示し、input は表示しない', () => {
    const onComplete = vi.fn()
    render(<PracticeMode stepId="step-choice" questions={choiceQuestions} onComplete={onComplete} />)

    expect(screen.getByText('不正解A')).toBeTruthy()
    expect(screen.getByText('正解の選択肢')).toBeTruthy()
    expect(screen.getByText('不正解B')).toBeTruthy()
    expect(screen.getByText('不正解C')).toBeTruthy()
    expect(screen.queryByLabelText('Q1 回答欄')).toBeNull()
  })

  it('選択式問題で正解を選択して判定すると正解表示になる', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<PracticeMode stepId="step-choice" questions={choiceQuestions} onComplete={onComplete} />)

    await user.click(screen.getByText('正解の選択肢'))
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status').textContent).toContain('Practiceを完了しました')
  })

  it('選択式問題で不正解を選択して判定すると不正解表示になる', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<PracticeMode stepId="step-choice" questions={choiceQuestions} onComplete={onComplete} />)

    await user.click(screen.getByText('不正解A'))
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(onComplete).not.toHaveBeenCalled()
    expect(screen.getByRole('status').textContent).toContain('まだ不正解の問題があります')
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
    expect(screen.getByRole('status').className).toContain('animate-fadeIn')
    expect(screen.getByText('ヒント1')).toBeTruthy()

    rerender(<PracticeMode stepId="step-b" questions={secondQuestions} onComplete={onComplete} />)

    expect((screen.getByLabelText('Q1 回答欄') as HTMLInputElement).value).toBe('')
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.queryByText('ヒント1')).toBeNull()
    expect(screen.getByText('Q1. 次の質問')).toBeTruthy()
  })
})
