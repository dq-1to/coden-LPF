import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { PracticeModeNav } from '../PracticeModeNav'

afterEach(() => {
  cleanup()
})

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <PracticeModeNav />
    </MemoryRouter>,
  )
}

describe('PracticeModeNav', () => {
  it('4つの練習モードリンクを表示する', () => {
    renderWithRouter('/daily')
    expect(screen.getAllByText('デイリー').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('ドクター').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('ミニプロ').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('リーディング').length).toBeGreaterThanOrEqual(1)
  })

  it('現在のパスに対応するリンクがアクティブになる', () => {
    renderWithRouter('/daily')
    const activeLinks = screen.getAllByRole('link', { current: 'page' })
    expect(activeLinks.length).toBeGreaterThanOrEqual(1)
    expect(activeLinks[0]!.getAttribute('href')).toBe('/daily')
  })

  it('サブパスでもアクティブ判定が効く', () => {
    renderWithRouter('/practice/mini-projects/proj-1')
    const activeLinks = screen.getAllByRole('link', { current: 'page' })
    expect(activeLinks.some((el) => el.getAttribute('href') === '/practice/mini-projects')).toBe(true)
  })

  it('別ページのリンクは非アクティブ', () => {
    renderWithRouter('/daily')
    const doctorLinks = screen.getAllByText('ドクター')
    const doctorLink = doctorLinks[0]!.closest('a')
    expect(doctorLink?.getAttribute('aria-current')).toBeNull()
  })
})
