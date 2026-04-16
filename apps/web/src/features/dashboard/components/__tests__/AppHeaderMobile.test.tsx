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

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAdmin: false,
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
    expect(screen.getByRole('dialog', { name: 'モバイルナビゲーション' })).toBeTruthy()
  })

  it('ドロワー内にナビゲーションリンクが表示される', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    const nav = screen.getByRole('dialog', { name: 'モバイルナビゲーション' })
    expect(nav.querySelector('a[href="/"]')).toBeTruthy()
    expect(nav.querySelector('a[href="/profile"]')).toBeTruthy()
  })

  it('ドロワー内にユーザー情報が表示される', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    const drawer = screen.getByRole('dialog', { name: 'モバイルナビゲーション' })
    expect(drawer.textContent).toContain('テストユーザー')
    expect(drawer.textContent).toContain('200 Pt')
    expect(drawer.textContent).toContain('5日連続')
  })

  it('ドロワー内にログアウトボタンがある', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    const nav = screen.getByRole('dialog', { name: 'モバイルナビゲーション' })
    const buttons = nav.querySelectorAll('button')
    const logoutButtons = Array.from(buttons).filter(b => b.textContent === 'ログアウト')
    expect(logoutButtons.length).toBeGreaterThan(0)
  })

  it('閉じるボタンでドロワーが閉じる', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    expect(screen.getByRole('dialog', { name: 'モバイルナビゲーション' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'メニューを閉じる' }))
    expect(screen.queryByRole('dialog', { name: 'モバイルナビゲーション' })).toBeNull()
  })

  it('ESCキーでドロワーが閉じる', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    expect(screen.getByRole('dialog', { name: 'モバイルナビゲーション' })).toBeTruthy()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'モバイルナビゲーション' })).toBeNull()
  })

  it('ドロワーがフルスクリーンで表示される', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    const nav = screen.getByRole('dialog', { name: 'モバイルナビゲーション' })
    expect(nav.className).toContain('fixed')
    expect(nav.className).toContain('inset-0')
  })

  it('ドロワー内にセクションヘッダーが表示される', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    const nav = screen.getByRole('dialog', { name: 'モバイルナビゲーション' })
    expect(nav.textContent).toContain('メイン')
    expect(nav.textContent).toContain('学習コース')
    expect(nav.textContent).toContain('練習モード')
    expect(nav.textContent).toContain('その他')
  })
})
