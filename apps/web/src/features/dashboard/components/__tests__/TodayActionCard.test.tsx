import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { TodayActionCard } from '../TodayActionCard'
import type { RecommendedAction } from '../../../../services/recommendationService'

const action: RecommendedAction = {
  type: 'resume',
  title: 'Step 1 の Practice から再開',
  description: '途中までの学習をそのまま活かしましょう。',
  ctaLabel: 'Practice へ戻る',
  to: '/step/usestate-basic',
  stepId: 'usestate-basic',
  mode: 'practice',
}

describe('TodayActionCard', () => {
  it('推奨アクションとCTAを表示する', () => {
    render(
      <MemoryRouter>
        <TodayActionCard action={action} />
      </MemoryRouter>,
    )

    expect(screen.getByText('今日のおすすめ')).toBeTruthy()
    expect(screen.getByText('Step 1 の Practice から再開')).toBeTruthy()
    expect(screen.getByText('途中までの学習をそのまま活かしましょう。')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Practice へ戻る/ }).getAttribute('href')).toBe('/step/usestate-basic')
  })
})
