import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TestTask } from '../../../../content/fundamentals/steps'
import { CodePuzzle } from '../CodePuzzle'

vi.mock('prismjs', () => ({
  default: {
    highlight: (_code: string) => _code,
    languages: { tsx: {}, javascript: {} },
  },
}))
vi.mock('prismjs/components/prism-markup', () => ({}))
vi.mock('prismjs/components/prism-jsx', () => ({}))
vi.mock('prismjs/components/prism-typescript', () => ({}))
vi.mock('prismjs/components/prism-tsx', () => ({}))

afterEach(() => {
  cleanup()
})

// expectedKeywords.join('') => 'onChange' => tokenize => ['onChange']
const testTask: TestTask = {
  instruction: 'イベントプロパティを埋めてください。',
  starterCode: '<input value={name} ____={(e) => setName(e.target.value)} />',
  expectedKeywords: ['onChange'],
}

function findPoolButton(name: string): HTMLElement | undefined {
  return screen.getAllByRole('button').find((btn) => btn.textContent === name)
}

describe('CodePuzzle', () => {
  it('指示文とコードコンテキストが表示される', () => {
    render(<CodePuzzle task={testTask} onSubmit={vi.fn()} />)

    expect(screen.getByText('イベントプロパティを埋めてください。')).toBeTruthy()
    expect(screen.getByText('使えるパーツ')).toBeTruthy()
    expect(screen.getByText('パーツをタップして組み立てよう')).toBeTruthy()
  })

  it('トークンをタップすると組み立てエリアに追加される', async () => {
    const user = userEvent.setup()
    render(<CodePuzzle task={testTask} onSubmit={vi.fn()} />)

    // onChange is a correct token generated from expectedKeywords
    const poolButton = findPoolButton('onChange')
    expect(poolButton).toBeTruthy()

    await user.click(poolButton as HTMLElement)

    // Assembly area should no longer show placeholder
    expect(screen.queryByText('パーツをタップして組み立てよう')).toBeNull()
  })

  it('判定するボタンは初期状態で disabled', () => {
    render(<CodePuzzle task={testTask} onSubmit={vi.fn()} />)

    const judgeButton = screen.getByRole('button', { name: '判定する' })
    expect(judgeButton).toBeTruthy()
    expect((judgeButton as HTMLButtonElement).disabled).toBe(true)
  })

  it('トークンを組み立ててから判定するで onSubmit が呼ばれる', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CodePuzzle task={testTask} onSubmit={onSubmit} />)

    const poolButton = findPoolButton('onChange')
    expect(poolButton).toBeTruthy()
    await user.click(poolButton as HTMLElement)

    const judgeButton = screen.getByRole('button', { name: '判定する' })
    await user.click(judgeButton)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const firstCall = onSubmit.mock.calls[0] as string[]
    expect(firstCall[0]).toContain('onChange')
  })

  it('クリアボタンで組み立てをリセットする', async () => {
    const user = userEvent.setup()
    render(<CodePuzzle task={testTask} onSubmit={vi.fn()} />)

    const poolButton = findPoolButton('onChange')
    expect(poolButton).toBeTruthy()
    await user.click(poolButton as HTMLElement)

    // Clear button should appear
    const clearButton = screen.getByRole('button', { name: 'クリア' })
    expect(clearButton).toBeTruthy()
    await user.click(clearButton)

    // Placeholder should be back
    expect(screen.getByText('パーツをタップして組み立てよう')).toBeTruthy()
  })
})
