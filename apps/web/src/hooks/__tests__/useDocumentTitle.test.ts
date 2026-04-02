import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, renderHook } from '@testing-library/react'
import { useDocumentTitle } from '../useDocumentTitle'

const SUFFIX = ' | Coden'

describe('useDocumentTitle', () => {
  afterEach(() => {
    cleanup()
    document.title = ''
  })

  it('マウント時に document.title をサフィックス付きで設定する', () => {
    renderHook(() => useDocumentTitle('ダッシュボード'))

    expect(document.title).toBe('ダッシュボード' + SUFFIX)
  })

  it('アンマウント時に元のタイトルを復元する', () => {
    document.title = 'Original Title'

    const { unmount } = renderHook(() => useDocumentTitle('テストページ'))
    expect(document.title).toBe('テストページ' + SUFFIX)

    unmount()
    expect(document.title).toBe('Original Title')
  })

  it('title プロパティが変更されたらタイトルを更新する', () => {
    const { rerender } = renderHook(
      ({ title }) => useDocumentTitle(title),
      { initialProps: { title: 'ページA' } },
    )

    expect(document.title).toBe('ページA' + SUFFIX)

    rerender({ title: 'ページB' })
    expect(document.title).toBe('ページB' + SUFFIX)
  })
})
