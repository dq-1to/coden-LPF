import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CodeToolbar } from '../CodeToolbar'

vi.mock('@/hooks/useKeyboardVisible', () => ({
  useKeyboardVisible: () => true,
}))

afterEach(() => {
  cleanup()
})

describe('CodeToolbar', () => {
  it('記号バーのボタンが表示される', () => {
    render(<CodeToolbar onInsert={vi.fn()} />)

    expect(screen.getByText('{ }')).toBeTruthy()
    expect(screen.getByText('( )')).toBeTruthy()
    expect(screen.getByText('[ ]')).toBeTruthy()
    expect(screen.getByText('=>')).toBeTruthy()
    expect(screen.getByText('//')).toBeTruthy()
  })

  it('記号ボタンのpointerdownで onInsert が呼ばれる', async () => {
    const onInsert = vi.fn()
    const user = userEvent.setup()
    render(<CodeToolbar onInsert={onInsert} />)

    await user.pointer({ keys: '[MouseLeft]', target: screen.getByText('{ }') })
    expect(onInsert).toHaveBeenCalledWith('{}', 1)
  })

  it('キーワードが指定されると表示される', () => {
    render(<CodeToolbar keywords={['useState', 'onClick']} onInsert={vi.fn()} />)

    expect(screen.getByText('useState')).toBeTruthy()
    expect(screen.getByText('onClick')).toBeTruthy()
  })

  it('キーワードは最大8個まで表示される', () => {
    const manyKeywords = Array.from({ length: 15 }, (_, i) => `keyword${i}`)
    render(<CodeToolbar keywords={manyKeywords} onInsert={vi.fn()} />)

    // 記号バー11 + キーワード8 = 19 ボタン
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(19)
  })

  it('キーワードとReact共通キーワードが重複排除される', () => {
    render(<CodeToolbar keywords={['useState', 'customHook']} onInsert={vi.fn()} />)

    // useState は keywords にも REACT_COMMON_KEYWORDS にも含まれるが1つだけ表示
    const useStateButtons = screen.getAllByText('useState')
    expect(useStateButtons.length).toBe(1)
  })

  it('キーワードボタンのpointerdownで onInsert が呼ばれる', async () => {
    const onInsert = vi.fn()
    const user = userEvent.setup()
    render(<CodeToolbar keywords={['myFunc']} onInsert={onInsert} />)

    await user.pointer({ keys: '[MouseLeft]', target: screen.getByText('myFunc') })
    expect(onInsert).toHaveBeenCalledWith('myFunc')
  })
})
