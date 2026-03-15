import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppHeader } from '../AppHeader'

vi.mock('@/contexts/LearningContext', () => ({
  useLearningContext: () => ({
    stats: {
      total_points: 200,
      current_streak: 5,
    },
  }),
}))

afterEach(() => {
  cleanup()
})

function renderHeader(pathname = '/') {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <AppHeader displayName="テストユーザー" onSignOut={() => undefined} />
    </MemoryRouter>,
  )
}

describe('AppHeader モバイルドロワー', () => {
  it('ハンバーガーボタンが表示される', () => {
    renderHeader()
    const button = screen.getByRole('button', { name: 'メニューを開く' })
    expect(button).toBeTruthy()
  })

  it('ハンバーガーボタンをクリックするとドロワーが開く', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    expect(screen.getByRole('navigation', { name: 'モバイルナビゲーション' })).toBeTruthy()
  })

  it('ドロワー内にナビゲーションリンクが表示される', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    const nav = screen.getByRole('navigation', { name: 'モバイルナビゲーション' })
    expect(nav.querySelector('a[href="/"]')).toBeTruthy()
    expect(nav.querySelector('a[href="/profile"]')).toBeTruthy()
  })

  it('ドロワー内にユーザー情報が表示される', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    // ドロワー内のユーザー名 — ヘッダーにもあるのでドロワーのnavを基準にする
    const drawer = screen.getByRole('navigation', { name: 'モバイルナビゲーション' })
    expect(drawer.parentElement?.textContent).toContain('テストユーザー')
    expect(drawer.parentElement?.textContent).toContain('200 Pt')
    expect(drawer.parentElement?.textContent).toContain('5日連続')
  })

  it('ドロワー内にログアウトボタンがある', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    // ドロワー内のログアウトボタン
    const nav = screen.getByRole('navigation', { name: 'モバイルナビゲーション' })
    const buttons = nav.parentElement?.querySelectorAll('button') ?? []
    const logoutButtons = Array.from(buttons).filter(b => b.textContent === 'ログアウト')
    expect(logoutButtons.length).toBeGreaterThan(0)
  })

  it('閉じるボタンでドロワーが閉じる', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    expect(screen.getByRole('navigation', { name: 'モバイルナビゲーション' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'メニューを閉じる' }))
    expect(screen.queryByRole('navigation', { name: 'モバイルナビゲーション' })).toBeNull()
  })

  it('ESCキーでドロワーが閉じる', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    expect(screen.getByRole('navigation', { name: 'モバイルナビゲーション' })).toBeTruthy()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('navigation', { name: 'モバイルナビゲーション' })).toBeNull()
  })

  it('オーバーレイクリックでドロワーが閉じる', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    expect(screen.getByRole('navigation', { name: 'モバイルナビゲーション' })).toBeTruthy()

    // aria-hidden="true" のオーバーレイをクリック
    const overlay = screen.getByRole('navigation', { name: 'モバイルナビゲーション' }).parentElement?.querySelector('[aria-hidden="true"]')
    expect(overlay).toBeTruthy()
    fireEvent.click(overlay!)
    expect(screen.queryByRole('navigation', { name: 'モバイルナビゲーション' })).toBeNull()
  })
})
