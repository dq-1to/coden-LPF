import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CodeContext } from '../CodeContext'

vi.mock('prismjs', () => ({
  default: {
    highlight: (code: string) => code,
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

describe('CodeContext', () => {
  it('code をハイライトして <pre> 内に表示する', () => {
    // Arrange
    const code = 'const x = 1'

    // Act
    const { container } = render(<CodeContext code={code} />)

    // Assert
    const pre = container.querySelector('pre')
    expect(pre).toBeTruthy()
    expect(pre?.textContent).toContain('const x = 1')
  })

  it('____ で分割しブランクラベルが表示される', () => {
    // Arrange
    const code = 'const x = ____'

    // Act
    render(<CodeContext code={code} />)

    // Assert
    expect(screen.getByText('▼ ここを組み立て')).toBeTruthy()
  })

  it('____ が複数ある場合に正しく分割される', () => {
    // Arrange
    // split('____') で3パーツになるため、ブランクは2つ表示される
    const code = '____ + ____'

    // Act
    render(<CodeContext code={code} />)

    // Assert
    const labels = screen.getAllByText('▼ ここを組み立て')
    expect(labels.length).toBe(2)
  })

  it('____ がないコードはブランクラベルなしでそのまま表示される', () => {
    // Arrange
    const code = 'const y = 2'

    // Act
    const { container } = render(<CodeContext code={code} />)

    // Assert
    expect(container.querySelector('pre')?.textContent).toContain('const y = 2')
    expect(screen.queryByText('▼ ここを組み立て')).toBeNull()
  })

  it('blankLabel props でラベルが変更できる', () => {
    // Arrange
    const code = 'const z = ____'
    const blankLabel = 'カスタムラベル'

    // Act
    render(<CodeContext code={code} blankLabel={blankLabel} />)

    // Assert
    expect(screen.getByText('カスタムラベル')).toBeTruthy()
    expect(screen.queryByText('▼ ここを組み立て')).toBeNull()
  })
})
