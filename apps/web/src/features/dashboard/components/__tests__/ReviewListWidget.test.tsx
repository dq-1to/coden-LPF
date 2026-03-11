import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ReviewListWidget } from '../ReviewListWidget'
import {
  addToReviewList,
  clearReviewList,
} from '@/services/reviewListService'

describe('ReviewListWidget', () => {
  beforeEach(() => {
    clearReviewList()
  })

  afterEach(() => {
    cleanup()
  })

  it('復習リストに保存されたステップを表示する', () => {
    addToReviewList('usestate-basic')

    render(
      <MemoryRouter>
        <ReviewListWidget />
      </MemoryRouter>,
    )

    expect(screen.getByText('復習リスト')).toBeTruthy()
    expect(screen.getByText('このリストは現在の端末とブラウザにのみ保存されます。')).toBeTruthy()
    expect(screen.getByRole('link', { name: /useState基礎/i }).getAttribute('href')).toBe('/step/usestate-basic')
  })

  it('削除操作で一覧から対象ステップを外す', async () => {
    const user = userEvent.setup()
    addToReviewList('usestate-basic')

    render(
      <MemoryRouter>
        <ReviewListWidget />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /復習リストから削除/i }))

    expect(screen.queryByText('復習リスト')).toBeNull()
  })
})
