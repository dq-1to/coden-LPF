import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ArticleView } from '../ArticleView'

vi.mock('prismjs', () => ({
  default: { highlightAll: vi.fn() },
}))
vi.mock('prismjs/components/prism-javascript', () => ({}))
vi.mock('prismjs/components/prism-jsx', () => ({}))

afterEach(() => {
  cleanup()
})

describe('ArticleView', () => {
  it('Markdown テキストが article 要素内にレンダリングされること', () => {
    render(<ArticleView markdown="Hello World" />)

    const article = document.querySelector('article')
    expect(article).toBeTruthy()
    expect(screen.getByText('Hello World')).toBeTruthy()
  })

  it('見出し(## Heading)が正しく h2 としてレンダリングされること', () => {
    render(<ArticleView markdown="## Heading" />)

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeTruthy()
    expect(heading.textContent).toBe('Heading')
  })

  it('remark-gfm によりリストが正しく変換されること', () => {
    const md = ['- item1', '- item2', '- item3'].join('\n')
    render(<ArticleView markdown={md} />)

    expect(screen.getByText('item1')).toBeTruthy()
    expect(screen.getByText('item2')).toBeTruthy()
    expect(screen.getByText('item3')).toBeTruthy()

    const listItems = document.querySelectorAll('li')
    expect(listItems.length).toBe(3)
  })
})
