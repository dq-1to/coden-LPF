import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAdminQualityDashboard, getAdminStepInsights } from '../adminQualityService'

type TableName =
  | 'profiles'
  | 'step_progress'
  | 'challenge_submissions'
  | 'daily_challenge_history'
  | 'mini_project_progress'
  | 'user_feedback'
  | 'review_items'
  | 'learning_events'

const tableState: Record<TableName, { data: unknown[]; count: number | null; error: unknown }> = {
  profiles: { data: [], count: 0, error: null },
  step_progress: { data: [], count: null, error: null },
  challenge_submissions: { data: [], count: null, error: null },
  daily_challenge_history: { data: [], count: null, error: null },
  mini_project_progress: { data: [], count: null, error: null },
  user_feedback: { data: [], count: null, error: null },
  review_items: { data: [], count: null, error: null },
  learning_events: { data: [], count: null, error: null },
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
    expect(dashboard.stepInsights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          stepId: 'usestate-basic',
          startedUsers: 2,
          readDoneUsers: 2,
          practiceDoneUsers: 2,
          testDoneUsers: 1,
          challengeDoneUsers: 1,
          completedUsers: 1,
          completionRate: 0.5,
          readToPracticeRate: 1,
          practiceToTestRate: 0.5,
          testToChallengeRate: 1,
          signal: 'watch',
          bottleneck: 'Practice → Test 50.0%',
        }),
        expect.objectContaining({
          stepId: 'events',
          startedUsers: 1,
          completionRate: 0,
          challengeSubmissions: 2,
          challengePassRate: 0,
          openReviewItems: 1,
          signal: 'attention',
        }),
      ]),
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

describe('getAdminStepInsights', () => {
  beforeEach(resetState)

  it('learning_events からステップ別の遷移率・誤答率・離脱率を集計する', async () => {
    tableState.learning_events.data = [
      {
        user_id: 'u1',
        event_type: 'step_started',
        step_id: 'usestate-basic',
        mode: null,
        payload: null,
        created_at: '2026-06-05T00:00:00Z',
      },
      {
        user_id: 'u1',
        event_type: 'mode_started',
        step_id: 'usestate-basic',
        mode: 'read',
        payload: null,
        created_at: '2026-06-05T00:01:00Z',
      },
      {
        user_id: 'u1',
        event_type: 'mode_started',
        step_id: 'usestate-basic',
        mode: 'practice',
        payload: null,
        created_at: '2026-06-05T00:02:00Z',
      },
      {
        user_id: 'u1',
        event_type: 'mode_started',
        step_id: 'usestate-basic',
        mode: 'test',
        payload: null,
        created_at: '2026-06-05T00:03:00Z',
      },
      {
        user_id: 'u1',
        event_type: 'mode_started',
        step_id: 'usestate-basic',
        mode: 'challenge',
        payload: null,
        created_at: '2026-06-05T00:04:00Z',
      },
      {
        user_id: 'u1',
        event_type: 'mode_completed',
        step_id: 'usestate-basic',
        mode: 'challenge',
        payload: null,
        created_at: '2026-06-05T00:05:00Z',
      },
      {
        user_id: 'u1',
        event_type: 'practice_answer_submitted',
        step_id: 'usestate-basic',
        mode: 'practice',
        payload: { isCorrect: true },
        created_at: '2026-06-05T00:06:00Z',
      },
      {
        user_id: 'u1',
        event_type: 'test_submitted',
        step_id: 'usestate-basic',
        mode: 'test',
        payload: { isCorrect: true },
        created_at: '2026-06-05T00:07:00Z',
      },
      {
        user_id: 'u1',
        event_type: 'challenge_submitted',
        step_id: 'usestate-basic',
        mode: 'challenge',
        payload: { isCorrect: true },
        created_at: '2026-06-05T00:08:00Z',
      },
      {
        user_id: 'u2',
        event_type: 'step_started',
        step_id: 'usestate-basic',
        mode: null,
        payload: null,
        created_at: '2026-06-05T01:00:00Z',
      },
      {
        user_id: 'u2',
        event_type: 'mode_started',
        step_id: 'usestate-basic',
        mode: 'read',
        payload: null,
        created_at: '2026-06-05T01:01:00Z',
      },
      {
        user_id: 'u2',
        event_type: 'mode_started',
        step_id: 'usestate-basic',
        mode: 'practice',
        payload: null,
        created_at: '2026-06-05T01:02:00Z',
      },
      {
        user_id: 'u2',
        event_type: 'practice_answer_submitted',
        step_id: 'usestate-basic',
        mode: 'practice',
        payload: { isCorrect: false },
        created_at: '2026-06-05T01:03:00Z',
      },
      {
        user_id: 'u2',
        event_type: 'test_submitted',
        step_id: 'usestate-basic',
        mode: 'test',
        payload: { isCorrect: false },
        created_at: '2026-06-05T01:04:00Z',
      },
    ]
    tableState.user_feedback.data = [
      {
        status: 'new',
        created_at: '2026-06-05T02:00:00Z',
        page_url: 'http://localhost:5173/step/usestate-basic?mode=practice',
      },
      {
        status: 'resolved',
        created_at: '2026-06-05T03:00:00Z',
        page_url: 'http://localhost:5173/step/events',
      },
    ]

    const insights = await getAdminStepInsights()
    const row = insights.rows.find((item) => item.stepId === 'usestate-basic')

    expect(from).toHaveBeenCalledWith('learning_events')
    expect(insights.totalEvents).toBe(14)
    expect(insights.observedSteps).toBeGreaterThan(0)
    expect(row).toEqual(
      expect.objectContaining({
        stepId: 'usestate-basic',
        startedUsers: 2,
        readStartedUsers: 2,
        practiceStartedUsers: 2,
        testStartedUsers: 1,
        challengeStartedUsers: 1,
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
      }),
    )
  })

  it('イベントログ取得エラーを AppError に変換する', async () => {
    tableState.learning_events.error = { code: 'DB_ERROR', message: 'forbidden' }

    await expect(getAdminStepInsights()).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'Step Insightsのイベントログ取得に失敗しました',
    })
  })
})
