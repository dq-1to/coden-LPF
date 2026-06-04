import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { AdminQualityDashboard } from '../../../services/adminQualityService'

const getAdminQualityDashboardMock = vi.hoisted(() => vi.fn())

vi.mock('../../../services/adminQualityService', async () => {
  const actual = await vi.importActual<typeof import('../../../services/adminQualityService')>(
    '../../../services/adminQualityService',
  )
  return {
    ...actual,
    getAdminQualityDashboard: (...args: unknown[]) => getAdminQualityDashboardMock(...args),
  }
})

vi.mock('../../../features/admin/components/AdminLayout', () => ({
  AdminLayout: ({ children }: { children: ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}))

vi.mock('../../../hooks/useDocumentTitle', () => ({
  useDocumentTitle: () => undefined,
}))

import { AdminQualityDashboardPage } from '../AdminQualityDashboardPage'

const SAMPLE_DASHBOARD: AdminQualityDashboard = {
  totalUsers: 3,
  activeLearners: 2,
  generatedAt: '2026-06-04T12:00:00.000Z',
  formalMetrics: [
    {
      id: 'four-mode-completion-rate',
      label: '4モード完了率',
      value: '33.3%',
      detail: '1 / 3 件のStep進捗が Read / Practice / Test / Challenge を完了',
      status: 'formal',
    },
    {
      id: 'challenge-pass-rate',
      label: 'Challenge合格率',
      value: '50.0%',
      detail: '1 / 2 件の提出が合格',
      status: 'formal',
    },
  ],
  provisionalMetrics: [
    {
      id: 'first-step-started-rate',
      label: '初回Step開始率',
      value: '66.7%',
      detail: '最初の実装済みStepに進捗行があるユーザー割合',
      status: 'provisional',
    },
  ],
  futureMetrics: [
    {
      id: 'read-to-practice-rate',
      label: 'Read → Practice遷移率',
      value: 'M2以降',
      detail: 'learning_events 導入後に正式表示',
      status: 'future',
    },
  ],
  improvementSteps: [
    {
      stepId: 'events',
      order: 2,
      title: 'イベント処理',
      startedUsers: 1,
      completedUsers: 0,
      completionRate: 0,
      challengeSubmissions: 2,
      challengePassRate: 0,
      openReviewItems: 1,
      priorityScore: 100,
      reasons: ['完了率 0.0%', 'Challenge 合格率 0.0%', '復習待ち 1件', '着手 1人'],
    },
  ],
  miniProjectStatus: {
    total: 2,
    completed: 1,
    inProgress: 1,
    notStarted: 0,
  },
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminQualityDashboardPage />
    </MemoryRouter>,
  )
}

describe('AdminQualityDashboardPage', () => {
  beforeEach(() => {
    getAdminQualityDashboardMock.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('品質KPIと改善優先ステップを表示する', async () => {
    getAdminQualityDashboardMock.mockResolvedValue(SAMPLE_DASHBOARD)
    renderPage()

    expect(await screen.findByRole('heading', { name: '品質ダッシュボード' })).toBeTruthy()
    expect(screen.getByText('4モード完了率')).toBeTruthy()
    expect(screen.getAllByText('正式表示').length).toBeGreaterThan(0)
    expect(screen.getByText('暫定表示')).toBeTruthy()
    expect(screen.getAllByText('M2以降').length).toBeGreaterThan(0)
    expect(screen.getByText('改善優先ステップ Top5')).toBeTruthy()
    expect(screen.getByText('Step 2「イベント処理」')).toBeTruthy()
    expect(screen.getByText('Read → Practice遷移率')).toBeTruthy()

    await waitFor(() => {
      expect(getAdminQualityDashboardMock).toHaveBeenCalledTimes(1)
    })
  })

  it('取得エラーを alert で表示する', async () => {
    getAdminQualityDashboardMock.mockRejectedValue(new Error('admin only'))
    renderPage()

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText('admin only')).toBeTruthy()
  })
})
