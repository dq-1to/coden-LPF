import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { QuizView } from '../QuizView'
import type { BaseNookQuestion } from '../../../../content/base-nook/types'

afterEach(() => {
  cleanup()
})

const q1: BaseNookQuestion = {
  id: 'q-1',
  text: 'varとletの違いは？',
  choices: [
    { label: 'スコープが違う' },
    { label: '速度が違う' },
    { label: '型が違う' },
    { label: '構文が違う' },
  ],
  correctIndex: 0,
  explanation: 'varは関数スコープ、letはブロックスコープです',
}

const q2: BaseNookQuestion = {
  id: 'q-2',
  text: 'constの特徴は？',
  choices: [
    { label: '再代入不可' },
    { label: '再宣言不可' },
    { label: 'どちらも' },
    { label: 'どちらでもない' },
  ],
  correctIndex: 2,
  explanation: 'constは再代入も再宣言も不可です',
}

describe('QuizView', () => {
  it('問題文と選択肢が表示される', () => {
    render(
      <QuizView
        questions={[q1]}
        solvedIds={new Set()}
        onAnswer={vi.fn()}
        onRefresh={vi.fn()}
        allCleared={false}
      />,
    )

    expect(screen.getByText('varとletの違いは？')).toBeTruthy()
    expect(screen.getByText('スコープが違う')).toBeTruthy()
    expect(screen.getByText('速度が違う')).toBeTruthy()
    expect(screen.getByText('型が違う')).toBeTruthy()
    expect(screen.getByText('構文が違う')).toBeTruthy()
  })

  it('回答するボタンは未選択時に無効', () => {
    render(
      <QuizView
        questions={[q1]}
        solvedIds={new Set()}
        onAnswer={vi.fn()}
        onRefresh={vi.fn()}
        allCleared={false}
      />,
    )

    const submitBtn = screen.getByRole('button', { name: '回答する' })
    expect(submitBtn).toHaveProperty('disabled', true)
  })

  it('選択肢を選んで回答すると正解フィードバックが表示される', async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn().mockResolvedValue(undefined)

    render(
      <QuizView
        questions={[q1]}
        solvedIds={new Set()}
        onAnswer={onAnswer}
        onRefresh={vi.fn()}
        allCleared={false}
      />,
    )

    // 正解の選択肢（index=0）をクリック
    await user.click(screen.getByText('スコープが違う'))
    await user.click(screen.getByRole('button', { name: '回答する' }))

    expect(onAnswer).toHaveBeenCalledWith('q-1', true)
    expect(screen.getByText(/正解/)).toBeTruthy()
    expect(screen.getByText('varは関数スコープ、letはブロックスコープです')).toBeTruthy()
  })

  it('不正解の場合は不正解フィードバックが表示される', async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn().mockResolvedValue(undefined)

    render(
      <QuizView
        questions={[q1]}
        solvedIds={new Set()}
        onAnswer={onAnswer}
        onRefresh={vi.fn()}
        allCleared={false}
      />,
    )

    // 不正解の選択肢（index=1）をクリック
    await user.click(screen.getByText('速度が違う'))
    await user.click(screen.getByRole('button', { name: '回答する' }))

    expect(onAnswer).toHaveBeenCalledWith('q-1', false)
    expect(screen.getByText(/不正解/)).toBeTruthy()
  })

  it('済バッジが正解済み問題に表示される', () => {
    render(
      <QuizView
        questions={[q1]}
        solvedIds={new Set(['q-1'])}
        onAnswer={vi.fn()}
        onRefresh={vi.fn()}
        allCleared={false}
      />,
    )

    expect(screen.getByText('済')).toBeTruthy()
  })

  it('全問クリア時にバナーが表示される', () => {
    render(
      <QuizView
        questions={[q1]}
        solvedIds={new Set(['q-1'])}
        onAnswer={vi.fn()}
        onRefresh={vi.fn()}
        allCleared={true}
      />,
    )

    expect(screen.getByText(/全問クリア/)).toBeTruthy()
  })

  it('別の3問に挑戦ボタンで onRefresh が呼ばれる', async () => {
    const user = userEvent.setup()
    const onRefresh = vi.fn()

    render(
      <QuizView
        questions={[q1, q2]}
        solvedIds={new Set()}
        onAnswer={vi.fn()}
        onRefresh={onRefresh}
        allCleared={false}
      />,
    )

    await user.click(screen.getByRole('button', { name: /別の3問に挑戦/ }))
    expect(onRefresh).toHaveBeenCalledOnce()
  })
})
