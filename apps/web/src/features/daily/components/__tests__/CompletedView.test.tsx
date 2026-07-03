import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CompletedView } from '../CompletedView'

afterEach(() => {
  cleanup()
})

describe('CompletedView', () => {
  it('完了メッセージが表示される', () => {
    render(
      <CompletedView
        completedAt="2026-04-02T10:30:00Z"
        pointsEarned={20}
        dateStr="2026-04-02"
        isCorrect
      />,
    )
    expect(screen.getByText('今日のチャレンジは完了です！')).toBeTruthy()
  })

  it('獲得ポイントが表示される', () => {
    render(
      <CompletedView
        completedAt="2026-04-02T10:30:00Z"
        pointsEarned={20}
        dateStr="2026-04-02"
        isCorrect
      />,
    )
    expect(screen.getByText('+20 Pt 獲得')).toBeTruthy()
  })

  it('ポイント0の場合はポイント表示なし', () => {
    render(
      <CompletedView completedAt="2026-04-02T10:30:00Z" pointsEarned={0} dateStr="2026-04-02" isCorrect />,
    )
    expect(screen.queryByText('+0 Pt 獲得')).toBeNull()
  })

  it('明日のメッセージが表示される', () => {
    render(
      <CompletedView completedAt={null} pointsEarned={0} dateStr="2026-04-02" isCorrect />,
    )
    expect(screen.getByText('明日またチャレンジしましょう')).toBeTruthy()
  })

  it('不正解時は「挑戦済み」表示になり、達成表示にならない', () => {
    render(
      <CompletedView
        completedAt="2026-04-02T10:30:00Z"
        pointsEarned={0}
        dateStr="2026-04-02"
        isCorrect={false}
      />,
    )
    expect(screen.getByText('今日は挑戦済みです')).toBeTruthy()
    expect(screen.queryByText('今日のチャレンジは完了です！')).toBeNull()
  })

  it('不正解時はPtバッジが表示されない', () => {
    render(
      <CompletedView
        completedAt="2026-04-02T10:30:00Z"
        pointsEarned={0}
        dateStr="2026-04-02"
        isCorrect={false}
      />,
    )
    expect(screen.queryByText(/Pt 獲得/)).toBeNull()
  })

  it('不正解時に正解と解説が表示される', () => {
    render(
      <CompletedView
        completedAt="2026-04-02T10:30:00Z"
        pointsEarned={0}
        dateStr="2026-04-02"
        isCorrect={false}
        correctAnswer="useState"
        explanation="useState を使います。"
      />,
    )
    expect(screen.getByText('useState')).toBeTruthy()
    expect(screen.getByText('useState を使います。')).toBeTruthy()
  })
})
