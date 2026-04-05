import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, it, expect } from 'vitest'
import { MilestoneGuide } from '../MilestoneGuide'
import type { MiniProjectMilestone } from '../../../../content/mini-projects/types'

afterEach(() => {
  cleanup()
})

const MILESTONES: MiniProjectMilestone[] = [
  { id: 'm1', title: 'ステップ1', description: '最初のステップ', requiredKeywords: ['useState'] },
  { id: 'm2', title: 'ステップ2', description: '次のステップ', requiredKeywords: ['useEffect'] },
  { id: 'm3', title: 'ステップ3', description: '最後のステップ', requiredKeywords: ['fetch'] },
]

describe('MilestoneGuide', () => {
  it('全マイルストーンのステッパーノードを表示する', () => {
    render(
      <MilestoneGuide milestones={MILESTONES} currentIndex={0} milestoneResults={null} />,
    )

    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('currentIndex のマイルストーン説明を表示する', () => {
    render(
      <MilestoneGuide milestones={MILESTONES} currentIndex={1} milestoneResults={null} />,
    )

    expect(screen.getByText(/Step 2/)).toBeTruthy()
    expect(screen.getByText('次のステップ')).toBeTruthy()
  })

  it('完了したマイルストーンに✓を表示する', () => {
    render(
      <MilestoneGuide
        milestones={MILESTONES}
        currentIndex={1}
        milestoneResults={[
          { milestoneId: 'm1', passed: true },
          { milestoneId: 'm2', passed: false },
          { milestoneId: 'm3', passed: false },
        ]}
      />,
    )

    // m1 は完了 → ✓ 表示
    expect(screen.getAllByText('✓').length).toBeGreaterThan(0)
    // m2 は現在 → 番号表示
    expect(screen.getByText('2')).toBeTruthy()
    // m3 は未着手 → 番号表示
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('ステッパーノードが 44px タップターゲットを満たす', () => {
    render(
      <MilestoneGuide milestones={MILESTONES} currentIndex={0} milestoneResults={null} />,
    )

    const nodes = screen.getAllByRole('status')
    for (const node of nodes) {
      expect(node.className).toContain('min-h-[44px]')
      expect(node.className).toContain('min-w-[44px]')
    }
  })
})
