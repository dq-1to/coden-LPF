import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { WeeklyStatus } from '../WeeklyStatus'

afterEach(() => {
  cleanup()
})
import type { WeeklyStatusEntry } from '../../../../content/daily/types'

const mockEntries: WeeklyStatusEntry[] = [
  { date: '2026-03-30', completed: true },
  { date: '2026-03-31', completed: true },
  { date: '2026-04-01', completed: false },
  { date: '2026-04-02', completed: false },
  { date: '2026-04-03', completed: false },
  { date: '2026-04-04', completed: false },
  { date: '2026-04-05', completed: false },
]

describe('WeeklyStatus', () => {
  it('今週の達成状況を表示する', () => {
    render(<WeeklyStatus entries={mockEntries} todayStr="2026-04-02" />)
    expect(screen.getByText('今週の達成状況')).toBeTruthy()
    expect(screen.getByText('2 / 7 日')).toBeTruthy()
  })

  it('7日分の状態が表示される', () => {
    render(<WeeklyStatus entries={mockEntries} todayStr="2026-04-02" />)
    // 達成日は ✓、今日は ●、その他は ○
    expect(screen.getAllByText('✓').length).toBe(2)
    expect(screen.getAllByText('●').length).toBe(1)
    expect(screen.getAllByText('○').length).toBe(4)
  })

  it('達成日と未達成日にaria-labelが付く', () => {
    render(<WeeklyStatus entries={mockEntries} todayStr="2026-04-02" />)
    expect(screen.getByLabelText('2026-03-30 達成')).toBeTruthy()
    expect(screen.getByLabelText('2026-04-02 未達成')).toBeTruthy()
  })
})
