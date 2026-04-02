import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CompletedView } from '../CompletedView'

afterEach(() => {
  cleanup()
})

describe('CompletedView', () => {
  it('完了メッセージが表示される', () => {
    render(
      <CompletedView completedAt="2026-04-02T10:30:00Z" pointsEarned={20} dateStr="2026-04-02" />,
    )
    expect(screen.getByText('今日のチャレンジは完了です！')).toBeTruthy()
  })

  it('獲得ポイントが表示される', () => {
    render(
      <CompletedView completedAt="2026-04-02T10:30:00Z" pointsEarned={20} dateStr="2026-04-02" />,
    )
    expect(screen.getByText('+20 Pt 獲得')).toBeTruthy()
  })

  it('ポイント0の場合はポイント表示なし', () => {
    render(
      <CompletedView completedAt="2026-04-02T10:30:00Z" pointsEarned={0} dateStr="2026-04-02" />,
    )
    expect(screen.queryByText('+0 Pt 獲得')).toBeNull()
  })

  it('明日のメッセージが表示される', () => {
    render(
      <CompletedView completedAt={null} pointsEarned={0} dateStr="2026-04-02" />,
    )
    expect(screen.getByText('明日またチャレンジしましょう')).toBeTruthy()
  })
})
