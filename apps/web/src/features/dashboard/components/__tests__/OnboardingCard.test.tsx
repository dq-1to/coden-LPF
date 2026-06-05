import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ONBOARDING_DISMISSED_KEY, OnboardingCard } from '../OnboardingCard'

function renderCard() {
  return render(
    <MemoryRouter>
      <OnboardingCard startTo="/step/usestate-basic" />
    </MemoryRouter>,
  )
}

describe('OnboardingCard', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('4段階フローと開始リンクを表示する', () => {
    renderCard()

    expect(screen.getByText('はじめての方へ')).toBeTruthy()
    expect(screen.getByText('4つの流れで1ステップずつ進めます')).toBeTruthy()
    expect(screen.getByText('Readで概念を読み、Practiceで手を動かします。')).toBeTruthy()
    expect(screen.getByText('Testで理解を確認し、Challengeで自分のコードにします。')).toBeTruthy()
    expect(screen.getByRole('link', { name: '始める' }).getAttribute('href')).toBe('/step/usestate-basic')
  })

  it('閉じるとlocalStorageへ保存し、画面から消える', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: '閉じる' }))

    expect(window.localStorage.getItem(ONBOARDING_DISMISSED_KEY)).toBe('true')
    expect(screen.queryByText('4つの流れで1ステップずつ進めます')).toBeNull()
  })

  it('保存済みの場合は表示しない', () => {
    window.localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true')

    renderCard()

    expect(screen.queryByText('はじめての方へ')).toBeNull()
  })
})
