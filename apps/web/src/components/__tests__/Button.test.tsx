import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../Button'

afterEach(() => {
  cleanup()
})

describe('Button', () => {
  it('children をレンダリングする', () => {
    render(<Button>テスト</Button>)
    expect(screen.getByRole('button', { name: 'テスト' })).toBeTruthy()
  })

  it('デフォルトで primary バリアントが適用される', () => {
    render(<Button>Primary</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-primary-mint')
  })

  it('secondary バリアントが適用される', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-slate-100')
  })

  it('danger バリアントが適用される', () => {
    render(<Button variant="danger">Danger</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-rose-600')
  })

  it('sm サイズが適用される', () => {
    render(<Button size="sm">Small</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('px-3')
    expect(btn.className).toContain('text-xs')
  })

  it('lg サイズが適用される', () => {
    render(<Button size="lg">Large</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('px-6')
  })

  it('fullWidth で w-full が適用される', () => {
    render(<Button fullWidth>Full</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('w-full')
  })

  it('disabled 時に disabled スタイルが適用される', () => {
    render(<Button disabled>Disabled</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toHaveProperty('disabled', true)
    expect(btn.className).toContain('disabled:bg-slate-200')
  })

  it('onClick が呼ばれる', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('disabled 時に onClick が呼ばれない', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('追加の className を渡せる', () => {
    render(<Button className="mt-4">Extra</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('mt-4')
  })

  it('type 属性を渡せる', () => {
    render(<Button type="submit">Submit</Button>)
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('type')).toBe('submit')
  })

  it('フォーカスリングにブランドカラーが使われる', () => {
    render(<Button>Focus</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('focus:ring-primary-mint')
  })
})
