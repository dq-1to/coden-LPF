import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { PageSpinner, Spinner } from '../Spinner'

afterEach(() => {
  cleanup()
})

describe('Spinner', () => {
  it('role="status" でレンダリングされる', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('デフォルトで aria-label="読み込み中" が設定される', () => {
    render(<Spinner />)
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('読み込み中')
  })

  it('label を指定するとテキストが表示される', () => {
    render(<Spinner label="データを取得中..." />)
    expect(screen.getByText('データを取得中...')).toBeTruthy()
  })

  it('label を指定すると aria-label にも反映される', () => {
    render(<Spinner label="認証確認中..." />)
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe('認証確認中...')
  })

  it('label なしではテキストが表示されない', () => {
    const { container } = render(<Spinner />)
    const spans = container.querySelectorAll('span')
    expect(spans.length).toBe(0)
  })

  it('className を追加できる', () => {
    const { container } = render(<Spinner className="mt-4" />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('mt-4')
  })
})

describe('PageSpinner', () => {
  it('フルスクリーンのローディング表示をレンダリングする', () => {
    render(<PageSpinner />)
    expect(screen.getByText('読み込み中...')).toBeTruthy()
  })

  it('カスタムラベルを表示できる', () => {
    render(<PageSpinner label="認証状態を確認中..." />)
    expect(screen.getByText('認証状態を確認中...')).toBeTruthy()
  })

  it('min-h-screen でフルスクリーン表示になる', () => {
    const { container } = render(<PageSpinner />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('min-h-screen')
  })
})
