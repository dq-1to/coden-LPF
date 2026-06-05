import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { AdminStepInsights } from '../../../services/adminQualityService'

const getAdminStepInsightsMock = vi.hoisted(() => vi.fn())

vi.mock('../../../services/adminQualityService', async () => {
  const actual = await vi.importActual<typeof import('../../../services/adminQualityService')>(
    '../../../services/adminQualityService',
  )
  return {
    ...actual,
    getAdminStepInsights: (...args: unknown[]) => getAdminStepInsightsMock(...args),
  }
})

vi.mock('../../../features/admin/components/AdminLayout', () => ({
  AdminLayout: ({ children }: { children: ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}))

vi.mock('../../../hooks/useDocumentTitle', () => ({
  useDocumentTitle: () => undefined,
}))

import { AdminStepInsightsPage } from '../AdminStepInsightsPage'

const SAMPLE_INSIGHTS: AdminStepInsights = {
  generatedAt: '2026-06-05T12:00:00.000Z',
  totalEvents: 14,
  observedSteps: 2,
  attentionSteps: 1,
  rows: [
    {
      stepId: 'usestate-basic',
      courseId: 'react-basics',
      courseTitle: 'React 基礎',
      order: 1,
      title: 'useState基礎',
      eventCount: 14,
      startedUsers: 2,
      readStartedUsers: 2,
      practiceStartedUsers: 2,
      testStartedUsers: 1,
      challengeStartedUsers: 1,
      readCompletedUsers: 2,
      practiceCompletedUsers: 1,
      testCompletedUsers: 1,
      challengeCompletedUsers: 1,
      completionRate: 0.5,
      readToPracticeRate: 1,
      practiceToTestRate: 0.5,
      testToChallengeRate: 1,
      dropoffRate: 0.5,
      practiceSubmissions: 2,
      practiceIncorrectRate: 0.5,
      testSubmissions: 2,
      testFailureRate: 0.5,
      challengeSubmissions: 1,
      challengePassRate: 1,
      relatedFeedbackCount: 1,
      newFeedbackCount: 1,
      bottleneck: '離脱率 50.0%',
      signal: 'watch',
    },
    {
      stepId: 'events',
      courseId: 'react-basics',
      courseTitle: 'React 基礎',
      order: 2,
      title: 'イベント処理',
      eventCount: 9,
      startedUsers: 3,
      readStartedUsers: 3,
      practiceStartedUsers: 2,
      testStartedUsers: 1,
      challengeStartedUsers: 0,
      readCompletedUsers: 2,
      practiceCompletedUsers: 1,
      testCompletedUsers: 0,
      challengeCompletedUsers: 0,
      completionRate: 0,
      readToPracticeRate: 2 / 3,
      practiceToTestRate: 0.5,
      testToChallengeRate: 0,
      dropoffRate: 1,
      practiceSubmissions: 4,
      practiceIncorrectRate: 0.75,
      testSubmissions: 3,
      testFailureRate: 1,
      challengeSubmissions: 0,
      challengePassRate: null,
      relatedFeedbackCount: 3,
      newFeedbackCount: 2,
      bottleneck: '離脱率 100.0%',
      signal: 'attention',
    },
  ],
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminStepInsightsPage />
    </MemoryRouter>,
  )
}

describe('AdminStepInsightsPage', () => {
  beforeEach(() => {
    getAdminStepInsightsMock.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('Step Insightsの集計値とドリルダウンを表示する', async () => {
    getAdminStepInsightsMock.mockResolvedValue(SAMPLE_INSIGHTS)
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Step Insights' })).toBeTruthy()
    expect(screen.getAllByText('イベント数').length).toBeGreaterThan(0)
    expect(screen.getAllByText('14件').length).toBeGreaterThan(0)
    expect(screen.getByText('要対応Step')).toBeTruthy()
    expect(screen.getAllByText('Step 1「useState基礎」').length).toBeGreaterThan(0)
    expect(screen.getByText('Step 2「イベント処理」')).toBeTruthy()
    expect(screen.getByText('要対応')).toBeTruthy()
    expect(screen.getByText('Practice誤答 75.0%')).toBeTruthy()
    expect(screen.getByText('離脱率 50.0%')).toBeTruthy()

    const eventsRow = screen.getByText('Step 2「イベント処理」').closest('tr')
    expect(eventsRow).not.toBeNull()
    fireEvent.click(within(eventsRow as HTMLElement).getByRole('button', { name: '詳細' }))

    expect(await screen.findByRole('heading', { name: 'Step 2「イベント処理」' })).toBeTruthy()
    expect(screen.getByText('離脱率 100.0%')).toBeTruthy()
    expect(screen.getAllByText('3件').length).toBeGreaterThan(0)

    await waitFor(() => {
      expect(getAdminStepInsightsMock).toHaveBeenCalledTimes(1)
    })
  })

  it('取得エラーを alert で表示する', async () => {
    getAdminStepInsightsMock.mockRejectedValue(new Error('admin only'))
    renderPage()

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText('admin only')).toBeTruthy()
  })
})
