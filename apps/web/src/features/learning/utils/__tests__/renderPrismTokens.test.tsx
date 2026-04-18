import { render } from '@testing-library/react'
import type { Token } from 'prismjs'
import { describe, expect, it } from 'vitest'
import { renderTokenStream } from '../renderPrismTokens'

function makeToken(type: string, content: string | Token | Array<string | Token>, alias: string | string[] = ''): Token {
  return { type, content, alias, length: 0, greedy: false } as Token
}

describe('renderTokenStream', () => {
  it('文字列トークンをそのまま <span> に描画する', () => {
    const { container } = render(<>{renderTokenStream(['hello'], 'k')}</>)
    expect(container.textContent).toBe('hello')
  })

  it('Token オブジェクトに token + type クラスを付与する', () => {
    const token = makeToken('keyword', 'const')
    const { container } = render(<>{renderTokenStream([token], 'k')}</>)

    const span = container.querySelector('span.token.keyword')
    expect(span).toBeTruthy()
    expect(span?.textContent).toBe('const')
  })

  it('alias が文字列の場合にクラスに含める', () => {
    const token = makeToken('function', 'useState', 'builtin')
    const { container } = render(<>{renderTokenStream([token], 'k')}</>)

    const span = container.querySelector('span.token.function.builtin')
    expect(span).toBeTruthy()
  })

  it('alias が配列の場合にすべてクラスに含める', () => {
    const token = makeToken('tag', 'div', ['important', 'bold'])
    const { container } = render(<>{renderTokenStream([token], 'k')}</>)

    const span = container.querySelector('span.token.tag.important.bold')
    expect(span).toBeTruthy()
  })

  it('ネストした Token を再帰的に描画する', () => {
    const inner = makeToken('attr-name', 'onClick')
    const outer = makeToken('tag', [inner])
    const { container } = render(<>{renderTokenStream([outer], 'k')}</>)

    const outerSpan = container.querySelector('span.token.tag')
    expect(outerSpan).toBeTruthy()
    const innerSpan = outerSpan?.querySelector('span.token.attr-name')
    expect(innerSpan).toBeTruthy()
    expect(innerSpan?.textContent).toBe('onClick')
  })

  it('空の alias はクラスに含めない', () => {
    const token = makeToken('number', '42', '')
    const { container } = render(<>{renderTokenStream([token], 'k')}</>)

    const span = container.querySelector('span.token.number')
    expect(span).toBeTruthy()
    expect(span?.className).toBe('token number')
  })

  it('混在するトークンストリームを正しく描画する', () => {
    const tokens: Array<string | Token> = [
      makeToken('keyword', 'const'),
      ' x = ',
      makeToken('number', '42'),
    ]
    const { container } = render(<>{renderTokenStream(tokens, 'k')}</>)

    expect(container.textContent).toBe('const x = 42')
    expect(container.querySelector('span.token.keyword')).toBeTruthy()
    expect(container.querySelector('span.token.number')).toBeTruthy()
  })
})
