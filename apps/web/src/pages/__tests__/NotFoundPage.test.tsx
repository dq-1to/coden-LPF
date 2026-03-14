import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { NotFoundPage } from '../NotFoundPage'

describe('NotFoundPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('404 メッセージとホームへの導線を表示する', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'ページが見つかりません' })).toBeTruthy()
    expect(screen.getByText('404 Not Found')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'ダッシュボードへ戻る' }).getAttribute('href')).toBe('/')
  })

  it('ログインページへの補助導線を表示する', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'ログインページを見る' }).getAttribute('href')).toBe('/login')
  })
})
