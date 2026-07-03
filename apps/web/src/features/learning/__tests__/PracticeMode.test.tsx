import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PracticeMode } from '../PracticeMode'
import type { PracticeQuestion } from '../../../content/fundamentals/steps'

const recordWrongAnswer = vi.fn()
const resolveReviewItem = vi.fn()
const trackLearningEvent = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '00000000-0000-0000-0000-000000000001' },
  }),
}))

vi.mock('../../../services/reviewService', () => ({
  recordWrongAnswer: (...args: unknown[]) => recordWrongAnswer(...args),
  resolveReviewItem: (...args: unknown[]) => resolveReviewItem(...args),
}))

vi.mock('../../../services/eventService', () => ({
  trackLearningEvent: (...args: unknown[]) => trackLearningEvent(...args),
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

const aliasQuestions: PracticeQuestion[] = [
  {
    id: 'q-alias',
    prompt: 'デフォルト動作を止めるメソッドは？',
    answer: 'preventDefault',
    answerAliases: ['e.preventDefault', 'preventDefault()', 'e.preventDefault()'],
    hint: 'イベントオブジェクトのメソッドです。',
    explanation: 'フォーム送信時のページリロードを止めます。',
  },
]

describe('PracticeMode', () => {
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
    expect(trackLearningEvent).toHaveBeenCalledWith({
      userId: '00000000-0000-0000-0000-000000000001',
      eventType: 'practice_answer_submitted',
      stepId: 'step-choice',
      mode: 'practice',
      courseId: null,
      payload: {
        isCorrect: true,
        itemCount: 1,
        questionIds: ['q-choice'],
      },
    })
    expect(screen.getByRole('status').textContent).toContain('Practiceを完了しました')
  })

  it('選択式問題で不正解を選択して判定すると不正解表示になる', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<PracticeMode stepId="step-choice" questions={choiceQuestions} onComplete={onComplete} />)

    await user.click(screen.getByText('不正解A'))
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(onComplete).not.toHaveBeenCalled()
    expect(trackLearningEvent).toHaveBeenCalledWith({
      userId: '00000000-0000-0000-0000-000000000001',
      eventType: 'practice_answer_submitted',
      stepId: 'step-choice',
      mode: 'practice',
      courseId: null,
      payload: {
        isCorrect: false,
        itemCount: 1,
        questionIds: ['q-choice'],
      },
    })
    expect(screen.getByRole('status').textContent).toContain('まだ不正解の問題があります')
  })

  it('短答式問題で answerAliases に含まれる自然な回答を正解として扱う', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<PracticeMode stepId="step-alias" questions={aliasQuestions} onComplete={onComplete} />)

    await user.type(screen.getByLabelText('Q1 回答欄'), 'e.preventDefault()')
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(trackLearningEvent).toHaveBeenCalledWith({
      userId: '00000000-0000-0000-0000-000000000001',
      eventType: 'practice_answer_submitted',
      stepId: 'step-alias',
      mode: 'practice',
      courseId: null,
      payload: {
        isCorrect: true,
        itemCount: 1,
        questionIds: ['q-alias'],
      },
    })
    expect(screen.getByText('正解です。')).toBeTruthy()
  })

  it('stepId が変わると回答・ヒント・判定状態をリセットする', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const { rerender } = render(<PracticeMode stepId="step-a" questions={firstQuestions} onComplete={onComplete} />)

    await user.type(screen.getByLabelText('Q1 回答欄'), 'React')
    await user.click(screen.getByRole('button', { name: 'ヒントを表示' }))
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(resolveReviewItem).toHaveBeenCalledWith({
      userId: '00000000-0000-0000-0000-000000000001',
      stepId: 'step-a',
      mode: 'practice',
      questionId: 'q1',
    })
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

describe('PracticeMode フィードバック拡張', () => {
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

  it('level に応じて 基本 / 応用 バッジを表示する', () => {
    const leveledQuestions: PracticeQuestion[] = [
      { id: 'q-basic', prompt: '基本問題', answer: 'A', hint: 'h', level: 'basic' },
      { id: 'q-applied', prompt: '応用問題', answer: 'B', hint: 'h', level: 'applied' },
    ]
    render(<PracticeMode stepId="step-level" questions={leveledQuestions} onComplete={vi.fn()} />)

    expect(screen.getByText('基本')).toBeTruthy()
    expect(screen.getByText('応用')).toBeTruthy()
  })

  it('level 未設定の問題はバッジを表示しない', () => {
    render(<PracticeMode stepId="step-nolevel" questions={firstQuestions} onComplete={vi.fn()} />)

    expect(screen.queryByText('基本')).toBeNull()
    expect(screen.queryByText('応用')).toBeNull()
  })

  it('不正解時に testedConcept（確認すること）を表示する', async () => {
    const user = userEvent.setup()
    const conceptQuestions: PracticeQuestion[] = [
      {
        id: 'q-concept',
        prompt: '確認事項つき問題',
        answer: '正解',
        hint: 'h',
        testedConcept: 'setterで状態を更新できているか',
      },
    ]
    render(<PracticeMode stepId="step-concept" questions={conceptQuestions} onComplete={vi.fn()} />)

    await user.type(screen.getByLabelText('Q1 回答欄'), 'ちがう')
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(screen.getByText('確認すること')).toBeTruthy()
    expect(screen.getByText('setterで状態を更新できているか')).toBeTruthy()
  })

  it('solutionText がある場合「解答例を見る」で解答例を表示できる', async () => {
    const user = userEvent.setup()
    const solutionQuestions: PracticeQuestion[] = [
      {
        id: 'q-sol',
        prompt: '解答例つき問題',
        answer: '正解',
        hint: 'h',
        solutionText: '答えは「正解」です。理由は…',
      },
    ]
    render(<PracticeMode stepId="step-sol" questions={solutionQuestions} onComplete={vi.fn()} />)

    await user.type(screen.getByLabelText('Q1 回答欄'), 'ちがう')
    await user.click(screen.getByRole('button', { name: '判定する' }))

    expect(screen.queryByText('答えは「正解」です。理由は…')).toBeNull()
    await user.click(screen.getByRole('button', { name: '解答例を見る' }))
    expect(screen.getByText('答えは「正解」です。理由は…')).toBeTruthy()
  })
})
