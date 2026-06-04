import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ReadMode } from '../ReadMode'

describe('ReadMode', () => {
  afterEach(() => {
    cleanup()
  })

  it('learningGoal と prerequisites がある場合は Read 冒頭に表示する', () => {
    render(
      <ReadMode
        markdown="# 本文"
        onComplete={vi.fn()}
        isCompleted={false}
        learningGoal="stateで画面を更新できるようになる"
        prerequisites={['Reactコンポーネントの基本', 'クリックイベントの基本']}
      />,
    )

    expect(screen.getByText('このStepのゴール')).toBeTruthy()
    expect(screen.getByText('stateで画面を更新できるようになる')).toBeTruthy()
    expect(screen.getByText('前提')).toBeTruthy()
    expect(screen.getByText('Reactコンポーネントの基本')).toBeTruthy()
    expect(screen.getByText('クリックイベントの基本')).toBeTruthy()
    expect(screen.getByRole('heading', { name: '本文' })).toBeTruthy()
  })

  it('Step メタ情報がない場合は概要表示を省略する', () => {
    render(<ReadMode markdown="# 本文" onComplete={vi.fn()} isCompleted={false} />)

    expect(screen.queryByText('このStepのゴール')).toBeNull()
    expect(screen.queryByText('前提')).toBeNull()
    expect(screen.getByRole('heading', { name: '本文' })).toBeTruthy()
  })
})
