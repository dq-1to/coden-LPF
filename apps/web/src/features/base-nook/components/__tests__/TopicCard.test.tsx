import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TopicCard } from '../TopicCard'
import type { BaseNookTopic, TopicProgressSummary } from '../../../../content/base-nook/types'

afterEach(() => {
  cleanup()
})

const topic: BaseNookTopic = {
  id: 'javascript',
  title: 'JavaScript の基礎',
  summary: 'テスト用サマリー',
  icon: 'Code',
  article: '# テスト',
  questions: [
    {
      id: 'q-1',
      text: '問題1',
      choices: [{ label: 'A' }, { label: 'B' }, { label: 'C' }, { label: 'D' }],
      correctIndex: 0,
      explanation: '解説',
    },
    {
      id: 'q-2',
      text: '問題2',
      choices: [{ label: 'A' }, { label: 'B' }, { label: 'C' }, { label: 'D' }],
      correctIndex: 1,
      explanation: '解説',
    },
  ],
}

describe('TopicCard', () => {
  it('タイトルとサマリーが表示される', () => {
    render(<TopicCard topic={topic} progress={undefined} onClick={vi.fn()} />)

    expect(screen.getByText('JavaScript の基礎')).toBeTruthy()
    expect(screen.getByText('テスト用サマリー')).toBeTruthy()
  })

  it('進捗がない場合はバッジが表示されない', () => {
    render(<TopicCard topic={topic} progress={undefined} onClick={vi.fn()} />)

    expect(screen.queryByText(/正解/)).toBeNull()
    expect(screen.queryByText(/全問クリア/)).toBeNull()
  })

  it('進捗がある場合は正解数を表示する', () => {
    const progress: TopicProgressSummary = { topicId: 'javascript', correctCount: 1 }
    render(<TopicCard topic={topic} progress={progress} onClick={vi.fn()} />)

    expect(screen.getByText('1/2 正解')).toBeTruthy()
  })

  it('全問正解で全問クリアバッジが表示される', () => {
    const progress: TopicProgressSummary = { topicId: 'javascript', correctCount: 2 }
    render(<TopicCard topic={topic} progress={progress} onClick={vi.fn()} />)

    expect(screen.getByText('全問クリア')).toBeTruthy()
  })

  it('クリックでコールバックが呼ばれる', () => {
    const onClick = vi.fn()
    render(<TopicCard topic={topic} progress={undefined} onClick={onClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
