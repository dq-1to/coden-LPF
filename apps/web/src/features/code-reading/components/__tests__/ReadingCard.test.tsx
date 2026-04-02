import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ReadingCard } from '../ReadingCard'

afterEach(() => {
  cleanup()
})
import type { CodeReadingProblem, CodeReadingProgress } from '../../../../content/code-reading/types'

const problem: CodeReadingProblem = {
  id: 'cr-basic-001',
  difficulty: 'basic',
  title: 'useState の初期化',
  description: 'useState フックの初期化パターンを読み解く',
  codeSnippet: 'const [count, setCount] = useState(0);',
  language: 'tsx',
  questions: [
    { id: 'q1', text: 'count の初期値は？', choices: ['0', '1', 'null', 'undefined'], correctIndex: 0, explanation: '0 が初期値' },
    { id: 'q2', text: 'setCount の役割は？', choices: ['値の参照', '値の更新', '型定義', 'エラー処理'], correctIndex: 1, explanation: 'state を更新する関数' },
    { id: 'q3', text: '分割代入の形式は？', choices: ['オブジェクト', '配列', 'タプル', 'Map'], correctIndex: 1, explanation: '配列の分割代入' },
  ],
}

describe('ReadingCard', () => {
  it('タイトルと説明が表示される', () => {
    render(<ReadingCard problem={problem} progress={undefined} onClick={vi.fn()} />)
    expect(screen.getByText(problem.title)).toBeTruthy()
    expect(screen.getByText(problem.description)).toBeTruthy()
  })

  it('難易度ラベルが表示される', () => {
    render(<ReadingCard problem={problem} progress={undefined} onClick={vi.fn()} />)
    expect(screen.getByText('基礎')).toBeTruthy()
  })

  it('設問数が表示される', () => {
    render(<ReadingCard problem={problem} progress={undefined} onClick={vi.fn()} />)
    expect(screen.getByText('設問 3問')).toBeTruthy()
  })

  it('完了済みの場合に正解数が表示される', () => {
    const progress: CodeReadingProgress = {
      problemId: 'cr-basic-001',
      correctCount: 3,
      totalCount: 3,
      completed: true,
      completedAt: '2026-04-01T10:00:00Z',
    }
    render(<ReadingCard problem={problem} progress={progress} onClick={vi.fn()} />)
    expect(screen.getByText('✅ 3/3')).toBeTruthy()
  })

  it('途中の場合に進捗が表示される', () => {
    const progress: CodeReadingProgress = {
      problemId: 'cr-basic-001',
      correctCount: 1,
      totalCount: 3,
      completed: false,
      completedAt: null,
    }
    render(<ReadingCard problem={problem} progress={progress} onClick={vi.fn()} />)
    expect(screen.getByText('🔄 1/3 正解')).toBeTruthy()
  })

  it('クリックでコールバックが呼ばれる', () => {
    const onClick = vi.fn()
    render(<ReadingCard problem={problem} progress={undefined} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
