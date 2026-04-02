import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DailyChallengeCard } from '../DailyChallengeCard'

afterEach(() => {
  cleanup()
})
import type { DailyQuestion, SubmitResult } from '../../../../content/daily/types'

const blankQuestion: DailyQuestion = {
  id: 'q-1',
  stepId: 'usestate-basic',
  type: 'blank',
  prompt: 'useState の初期値を設定する関数は？',
  answer: 'useState',
  hint: 'React Hooks の基本です',
  explanation: 'useState は状態管理の基本です',
}

const choiceQuestion: DailyQuestion = {
  id: 'q-2',
  stepId: 'events',
  type: 'choice',
  prompt: 'React でイベントハンドラを設定する属性は？',
  answer: 'onClick',
  hint: 'HTML の onclick に似ています',
  explanation: 'onClick は React のイベント属性です',
  choices: ['onclick', 'onClick', 'click', 'handleClick'],
}

describe('DailyChallengeCard', () => {
  it('穴埋め問題のプロンプトと入力欄が表示される', () => {
    render(
      <DailyChallengeCard question={blankQuestion} dateStr="2026-04-02" onSubmit={vi.fn()} />,
    )
    expect(screen.getByText(blankQuestion.prompt)).toBeTruthy()
    expect(screen.getByPlaceholderText('答えを入力...')).toBeTruthy()
    expect(screen.getByText('穴埋め')).toBeTruthy()
  })

  it('選択式問題で選択肢が表示される', () => {
    render(
      <DailyChallengeCard question={choiceQuestion} dateStr="2026-04-02" onSubmit={vi.fn()} />,
    )
    expect(screen.getByText('選択式')).toBeTruthy()
    expect(screen.getByText('onClick')).toBeTruthy()
    expect(screen.getByText('onclick')).toBeTruthy()
  })

  it('ヒントの表示/非表示を切り替えられる', () => {
    render(
      <DailyChallengeCard question={blankQuestion} dateStr="2026-04-02" onSubmit={vi.fn()} />,
    )
    expect(screen.queryByText(/React Hooks の基本です/)).toBeNull()
    fireEvent.click(screen.getByText('ヒントを見る'))
    expect(screen.getByText(/React Hooks の基本です/)).toBeTruthy()
  })

  it('回答送信後に結果が表示される', async () => {
    const mockResult: SubmitResult = {
      isCorrect: true,
      pointsEarned: 20,
      correctAnswer: 'useState',
      explanation: 'useState は状態管理の基本です',
    }
    const onSubmit = vi.fn().mockResolvedValue(mockResult)

    render(
      <DailyChallengeCard question={blankQuestion} dateStr="2026-04-02" onSubmit={onSubmit} />,
    )

    fireEvent.change(screen.getByPlaceholderText('答えを入力...'), {
      target: { value: 'useState' },
    })
    fireEvent.click(screen.getByText('判定する'))

    await waitFor(() => {
      expect(screen.getByText('正解！')).toBeTruthy()
    })
  })

  it('空白入力では判定ボタンが無効', () => {
    render(
      <DailyChallengeCard question={blankQuestion} dateStr="2026-04-02" onSubmit={vi.fn()} />,
    )
    const button = screen.getByRole('button', { name: '判定する' })
    expect(button.hasAttribute('disabled')).toBe(true)
  })
})
