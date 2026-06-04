import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAdminQualityDashboard } from '../adminQualityService'

type TableName =
  | 'profiles'
  | 'step_progress'
  | 'challenge_submissions'
  | 'daily_challenge_history'
  | 'mini_project_progress'
  | 'user_feedback'
  | 'review_items'

const tableState: Record<TableName, { data: unknown[]; count: number | null; error: unknown }> = {
  profiles: { data: [], count: 0, error: null },
  step_progress: { data: [], count: null, error: null },
  challenge_submissions: { data: [], count: null, error: null },
  daily_challenge_history: { data: [], count: null, error: null },
  mini_project_progress: { data: [], count: null, error: null },
  user_feedback: { data: [], count: null, error: null },
  review_items: { data: [], count: null, error: null },
}

const from = vi.fn((table: TableName) => ({
  select: () =>
    Promise.resolve({
      data: tableState[table].data,
      count: tableState[table].count,
      error: tableState[table].error,
    }),
}))

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => from(...(args as [TableName])),
  },
}))

function resetState() {
  vi.clearAllMocks()
  for (const table of Object.keys(tableState) as TableName[]) {
    tableState[table] = { data: [], count: table === 'profiles' ? 0 : null, error: null }
  }
}

describe('getAdminQualityDashboard', () => {
  beforeEach(resetState)

  it('既存テーブルから品質KPIと改善優先ステップを集計する', async () => {
    tableState.profiles.count = 3
    tableState.step_progress.data = [
      {
        user_id: 'u1',
        step_id: 'usestate-basic',
        read_done: true,
        practice_done: true,
        test_done: true,
        challenge_done: true,
        completed_at: '2026-06-01T00:00:00Z',
      },
      {
        user_id: 'u2',
        step_id: 'usestate-basic',
        read_done: true,
        practice_done: true,
        test_done: false,
        challenge_done: false,
        completed_at: null,
      },
      {
        user_id: 'u1',
        step_id: 'events',
        read_done: true,
        practice_done: false,
        test_done: false,
        challenge_done: false,
        completed_at: null,
      },
    ]
    tableState.challenge_submissions.data = [
      { step_id: 'usestate-basic', is_passed: true, submitted_at: '2026-06-01T00:00:00Z' },
      { step_id: 'events', is_passed: false, submitted_at: '2026-06-01T00:00:00Z' },
      { step_id: 'events', is_passed: false, submitted_at: '2026-06-02T00:00:00Z' },
    ]
    tableState.daily_challenge_history.data = [
      { completed: true, challenge_date: '2026-06-01' },
      { completed: false, challenge_date: '2026-06-02' },
    ]
    tableState.mini_project_progress.data = [
      { project_id: 'todo-app', status: 'completed', completed_at: '2026-06-01T00:00:00Z' },
      { project_id: 'counter-extended', status: 'in_progress', completed_at: null },
    ]
    tableState.user_feedback.data = [
      { status: 'new', created_at: new Date().toISOString() },
      { status: 'resolved', created_at: '2020-01-01T00:00:00Z' },
    ]
    tableState.review_items.data = [
      { status: 'open', step_id: 'events' },
      { status: 'resolved', step_id: 'usestate-basic' },
    ]

    const dashboard = await getAdminQualityDashboard()

    expect(from).toHaveBeenCalledWith('profiles')
    expect(from).toHaveBeenCalledWith('step_progress')
    expect(from).toHaveBeenCalledWith('challenge_submissions')
    expect(dashboard.totalUsers).toBe(3)
    expect(dashboard.activeLearners).toBe(2)
    expect(dashboard.formalMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'four-mode-completion-rate',
          label: '4モード完了率',
          value: '33.3%',
          status: 'formal',
        }),
        expect.objectContaining({
          id: 'challenge-pass-rate',
          value: '33.3%',
        }),
      ]),
    )
    expect(dashboard.provisionalMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'first-step-started-rate',
          value: '66.7%',
        }),
      ]),
    )
    expect(dashboard.miniProjectStatus).toEqual({
      total: 2,
      completed: 1,
      inProgress: 1,
      notStarted: 0,
    })
    expect(dashboard.improvementSteps[0]).toEqual(
      expect.objectContaining({
        stepId: 'events',
        title: 'イベント処理',
        openReviewItems: 1,
      }),
    )
  })

  it('クエリエラーを AppError に変換する', async () => {
    tableState.step_progress.error = { code: 'DB_ERROR', message: 'forbidden' }

    await expect(getAdminQualityDashboard()).rejects.toMatchObject({
      name: 'AppError',
      userMessage: '品質KPIのステップ進捗取得に失敗しました',
    })
  })
})
