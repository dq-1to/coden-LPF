import type { Token } from 'prismjs'
import type { ReactNode } from 'react'

/**
 * Prism.tokenize() が返すトークン配列を React 要素に変換する。
 * dangerouslySetInnerHTML を使わずにシンタックスハイライトを実現する。
 */
export function renderTokenStream(
  tokens: Array<string | Token>,
  keyPrefix: string,
): ReactNode[] {
  return tokens.map((token, i) => {
    const key = `${keyPrefix}-${String(i)}`

    if (typeof token === 'string') {
      return <span key={key}>{token}</span>
    }

    const classes = buildClassList(token.type, token.alias)
    const children = renderContent(token.content, key)

    return (
      <span key={key} className={classes}>
        {children}
      </span>
    )
  })
}

function buildClassList(type: string, alias: string | string[]): string {
  const parts = ['token', type]
  if (typeof alias === 'string') {
    if (alias) parts.push(alias)
  } else if (Array.isArray(alias)) {
    parts.push(...alias)
  }
  return parts.join(' ')
}

function renderContent(
  content: string | Token | Array<string | Token>,
  keyPrefix: string,
): ReactNode {
  if (typeof content === 'string') {
    return content
  }
  if (Array.isArray(content)) {
    return renderTokenStream(content, keyPrefix)
  }
  // Single nested Token
  const classes = buildClassList(content.type, content.alias)
  const children = renderContent(content.content, `${keyPrefix}-nested`)
  return <span className={classes}>{children}</span>
}
