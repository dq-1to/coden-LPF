import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProblemCard } from '../ProblemCard'

afterEach(() => {
  cleanup()
})
import type { CodeDoctorProblem, CodeDoctorProgress } from '../../../../content/code-doctor/types'

const problem: CodeDoctorProblem = {
  id: 'cd-beginner-001',
  category: 'react',
  difficulty: 'beginner',
  title: 'useEffect のクリーンアップ',
  description: 'useEffect でイベントリスナーを追加したが、クリーンアップがない',
  buggyCode: 'useEffect(() => { window.addEventListener("resize", fn) }, [])',
  hint: 'return 文でクリーンアップ関数を返す',
  requiredKeywords: ['removeEventListener'],
  ngKeywords: [],
  explanation: 'クリーンアップでリスナーを解除する必要がある',
}

describe('ProblemCard', () => {
  it('タイトルと説明が表示される', () => {
    render(<ProblemCard problem={problem} progress={undefined} onClick={vi.fn()} />)
    expect(screen.getByText(problem.title)).toBeTruthy()
    expect(screen.getByText(problem.description)).toBeTruthy()
  })

  it('難易度ラベルが表示される', () => {
    render(<ProblemCard problem={problem} progress={undefined} onClick={vi.fn()} />)
    expect(screen.getByText('初級')).toBeTruthy()
  })

  it('解決済みの場合にバッジが表示される', () => {
    const progress: CodeDoctorProgress = {
      problemId: 'cd-beginner-001',
      solved: true,
      attempts: 2,
      solvedAt: '2026-04-01T10:00:00Z',
    }
    render(<ProblemCard problem={problem} progress={progress} onClick={vi.fn()} />)
    expect(screen.getByText('✅ 解決済み')).toBeTruthy()
  })

  it('挑戦中の場合に回数が表示される', () => {
    const progress: CodeDoctorProgress = {
      problemId: 'cd-beginner-001',
      solved: false,
      attempts: 3,
      solvedAt: null,
    }
    render(<ProblemCard problem={problem} progress={progress} onClick={vi.fn()} />)
    expect(screen.getByText('3回挑戦中')).toBeTruthy()
  })

  it('クリックでコールバックが呼ばれる', () => {
    const onClick = vi.fn()
    render(<ProblemCard problem={problem} progress={undefined} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
