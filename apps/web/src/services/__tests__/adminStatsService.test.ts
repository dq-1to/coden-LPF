import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getDauLast30Days,
  getGlobalStatsSummary,
  getStepCompletionRates,
  getTopMissedQuestions,
} from '../adminStatsService'

const rpc = vi.fn()

// PostgREST の head:true / count / select / eq をモックするための状態
const tableState = {
  profilesCount: 0 as number | null,
  pointHistoryRows: [] as Array<{ amount: number }>,
  pointHistoryError: null as unknown,
  profilesError: null as unknown,
  feedbackTotalCount: 0 as number | null,
  feedbackTotalError: null as unknown,
  feedbackNewCount: 0 as number | null,
  feedbackNewError: null as unknown,
}

function createProfilesBuilder() {
  return {
    select: () =>
      Promise.resolve({ count: tableState.profilesCount, error: tableState.profilesError }),
  }
}

function createPointHistoryBuilder() {
  return {
    select: () =>
      Promise.resolve({ data: tableState.pointHistoryRows, error: tableState.pointHistoryError }),
  }
}

function createUserFeedbackBuilder() {
  // select() は thenable を返し、eq() を呼ぶと status=new のカウントに切り替わる
  return {
    select: () => {
      const chain = {
        eq() {
          return Promise.resolve({
            count: tableState.feedbackNewCount,
            error: tableState.feedbackNewError,
          })
        },
        then(resolve: (v: unknown) => unknown, reject: (r: unknown) => unknown) {
          return Promise.resolve({
            count: tableState.feedbackTotalCount,
            error: tableState.feedbackTotalError,
          }).then(resolve, reject)
        },
      }
      return chain
    },
  }
}

const from = vi.fn((table: string) => {
  if (table === 'profiles') return createProfilesBuilder()
  if (table === 'point_history') return createPointHistoryBuilder()
  if (table === 'user_feedback') return createUserFeedbackBuilder()
  throw new Error(`unexpected table: ${table}`)
})

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    rpc: (...args: unknown[]) => rpc(...args),
    from: (...args: unknown[]) => from(...(args as [string])),
  },
}))

function resetState() {
  vi.clearAllMocks()
  tableState.profilesCount = 0
  tableState.pointHistoryRows = []
  tableState.pointHistoryError = null
  tableState.profilesError = null
  tableState.feedbackTotalCount = 0
  tableState.feedbackTotalError = null
  tableState.feedbackNewCount = 0
  tableState.feedbackNewError = null
}

describe('getDauLast30Days', () => {
  beforeEach(resetState)

  it('get_dau_last_30_days RPC を呼び DauPoint[] に変換する', async () => {
    rpc.mockResolvedValue({
      data: [
        { activity_date: '2026-04-01', active_users: 3 },
        { activity_date: '2026-04-02', active_users: 5 },
      ],
      error: null,
    })
    const result = await getDauLast30Days()
    expect(rpc).toHaveBeenCalledWith('get_dau_last_30_days')
    expect(result).toEqual([
      { date: '2026-04-01', activeUsers: 3 },
      { date: '2026-04-02', activeUsers: 5 },
    ])
  })

  it('data が null なら空配列を返す', async () => {
    rpc.mockResolvedValue({ data: null, error: null })
    expect(await getDauLast30Days()).toEqual([])
  })

  it('RPC エラーを AppError に変換する', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: 'DB_ERROR', message: 'forbidden' } })
    await expect(getDauLast30Days()).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'DAU の取得に失敗しました',
    })
  })
})

describe('getStepCompletionRates', () => {
  beforeEach(resetState)

  it('get_step_completion_rates RPC 結果を変換する', async () => {
    rpc.mockResolvedValue({
      data: [
        { step_id: 'usestate-basic', total_users: 10, completed_users: 7, completion_rate: 0.7 },
      ],
      error: null,
    })
    const result = await getStepCompletionRates()
    expect(rpc).toHaveBeenCalledWith('get_step_completion_rates')
    expect(result).toEqual([
      { stepId: 'usestate-basic', totalUsers: 10, completedUsers: 7, completionRate: 0.7 },
    ])
  })

  it('RPC エラーを AppError に変換する', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: 'DB_ERROR', message: 'x' } })
    await expect(getStepCompletionRates()).rejects.toMatchObject({
      userMessage: 'ステップ完了率の取得に失敗しました',
    })
  })
})

describe('getTopMissedQuestions', () => {
  beforeEach(resetState)

  it('get_top_missed_questions RPC を limit/min で呼ぶ', async () => {
    rpc.mockResolvedValue({ data: [], error: null })
    await getTopMissedQuestions(5, 2)
    expect(rpc).toHaveBeenCalledWith('get_top_missed_questions', {
      p_limit: 5,
      p_min_attempts: 2,
    })
  })

  it('limit を 1..100 にクランプ', async () => {
    rpc.mockResolvedValue({ data: [], error: null })
    await getTopMissedQuestions(999, 3)
    expect(rpc).toHaveBeenCalledWith('get_top_missed_questions', {
      p_limit: 100,
      p_min_attempts: 3,
    })
    await getTopMissedQuestions(0, 3)
    expect(rpc).toHaveBeenLastCalledWith('get_top_missed_questions', {
      p_limit: 1,
      p_min_attempts: 3,
    })
  })

  it('min_attempts は最小 1', async () => {
    rpc.mockResolvedValue({ data: [], error: null })
    await getTopMissedQuestions(10, 0)
    expect(rpc).toHaveBeenCalledWith('get_top_missed_questions', {
      p_limit: 10,
      p_min_attempts: 1,
    })
  })

  it('RPC 結果を変換する', async () => {
    rpc.mockResolvedValue({
      data: [
        { step_id: 'events', attempt_count: 10, failure_count: 7, failure_rate: 0.7 },
      ],
      error: null,
    })
    const result = await getTopMissedQuestions()
    expect(result).toEqual([
      { stepId: 'events', attemptCount: 10, failureCount: 7, failureRate: 0.7 },
    ])
  })
})

describe('getGlobalStatsSummary', () => {
  beforeEach(resetState)

  it('4 つのクエリを並列呼びし集計結果を返す', async () => {
    tableState.profilesCount = 42
    tableState.pointHistoryRows = [{ amount: 10 }, { amount: 20 }, { amount: 5 }]
    tableState.feedbackTotalCount = 8
    tableState.feedbackNewCount = 3

    const summary = await getGlobalStatsSummary()

    expect(from).toHaveBeenCalledWith('profiles')
    expect(from).toHaveBeenCalledWith('point_history')
    expect(from).toHaveBeenCalledWith('user_feedback')
    expect(summary).toEqual({
      totalUsers: 42,
      totalPointsDistributed: 35,
      totalFeedback: 8,
      newFeedback: 3,
    })
  })

  it('いずれかのクエリエラーで AppError を投げる', async () => {
    tableState.pointHistoryError = { code: 'DB_ERROR', message: 'boom' }
    await expect(getGlobalStatsSummary()).rejects.toMatchObject({
      userMessage: 'ポイント履歴の取得に失敗しました',
    })
  })
})
