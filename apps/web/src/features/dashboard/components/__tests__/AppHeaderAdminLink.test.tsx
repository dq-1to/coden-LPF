import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppHeader } from '../AppHeader'

const mockAuth = vi.hoisted(() => ({
  value: { isAdmin: false },
}))

vi.mock('@/contexts/LearningContext', () => ({
  useLearningContext: () => ({
    stats: { total_points: 100, current_streak: 1 },
  }),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth.value,
}))

vi.mock('@/contexts/FeedbackContext', () => ({
  useFeedbackContext: () => ({ openFeedback: vi.fn() }),
}))

function renderHeader() {
  return render(
    <MemoryRouter>
      <AppHeader displayName="tester" onSignOut={() => undefined} />
    </MemoryRouter>,
  )
}

describe('AppHeader 管理画面リンク', () => {
  afterEach(() => {
    cleanup()
    mockAuth.value = { isAdmin: false }
  })

  it('非 admin のときデスクトップドロップダウンに管理画面リンクが表示されない', () => {
    mockAuth.value = { isAdmin: false }
    renderHeader()
    const nav = screen.getByRole('navigation', { name: 'メインナビゲーション' })
    fireEvent.click(within(nav).getByRole('button', { name: /カリキュラム/ }))

    expect(screen.queryByRole('menuitem', { name: /管理画面/ })).toBeNull()
  })

  it('admin のときデスクトップドロップダウンに管理画面リンクが表示される', () => {
    mockAuth.value = { isAdmin: true }
    renderHeader()
    const nav = screen.getByRole('navigation', { name: 'メインナビゲーション' })
    fireEvent.click(within(nav).getByRole('button', { name: /カリキュラム/ }))

    const adminLink = screen.getByRole('menuitem', { name: /管理画面/ })
    expect(adminLink.getAttribute('href')).toBe('/admin')
  })

  it('非 admin のときモバイルドロワーに管理画面リンクが表示されない', () => {
    mockAuth.value = { isAdmin: false }
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    const drawer = screen.getByRole('dialog', { name: 'モバイルナビゲーション' })
    expect(within(drawer).queryByText('管理画面')).toBeNull()
  })

  it('admin のときモバイルドロワーに管理画面リンクが表示される', () => {
    mockAuth.value = { isAdmin: true }
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }))
    const drawer = screen.getByRole('dialog', { name: 'モバイルナビゲーション' })
    const adminLink = within(drawer).getByRole('link', { name: /管理画面/ })
    expect(adminLink.getAttribute('href')).toBe('/admin')
  })
})
