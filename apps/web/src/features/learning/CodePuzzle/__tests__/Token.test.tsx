import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Token } from '../Token'

afterEach(() => {
  cleanup()
})

describe('Token', () => {
  it('テキストを表示する', () => {
    render(<Token text="setCount" onClick={vi.fn()} variant="pool" />)
    expect(screen.getByText('setCount')).toBeTruthy()
  })

  it('クリックで onClick が呼ばれる', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Token text="+" onClick={onClick} variant="pool" />)

    await user.click(screen.getByText('+'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 時はクリックが発火しない', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Token text="x" onClick={onClick} variant="pool" disabled />)

    await user.click(screen.getByText('x'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('pool バリアントのスタイルが適用される', () => {
    render(<Token text="a" onClick={vi.fn()} variant="pool" />)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-slate-700')
  })

  it('assembled バリアントのスタイルが適用される', () => {
    render(<Token text="a" onClick={vi.fn()} variant="assembled" />)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-emerald-800/30')
  })
})
