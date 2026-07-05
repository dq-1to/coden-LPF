import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getDauLast30Days,
  getGlobalStatsSummary,
  getStepCompletionRates,
  getTopMissedQuestions,
} from '../adminStatsService'

const rpc = vi.fn()

const from = vi.fn((table: string) => {
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

  it('admin_get_global_stats_summary RPC を呼び GlobalStatsSummary に変換する', async () => {
    rpc.mockResolvedValue({
      data: [
        {
          total_users: 42,
          total_points_distributed: 35,
          total_feedback: 8,
          new_feedback: 3,
        },
      ],
      error: null,
    })

    const summary = await getGlobalStatsSummary()

    expect(rpc).toHaveBeenCalledWith('admin_get_global_stats_summary')
    expect(from).not.toHaveBeenCalled()
    expect(summary).toEqual({
      totalUsers: 42,
      totalPointsDistributed: 35,
      totalFeedback: 8,
      newFeedback: 3,
    })
  })

  it('data が空配列のときは全項目 0 を返す', async () => {
    rpc.mockResolvedValue({ data: [], error: null })
    expect(await getGlobalStatsSummary()).toEqual({
      totalUsers: 0,
      totalPointsDistributed: 0,
      totalFeedback: 0,
      newFeedback: 0,
    })
  })

  it('data が null のときは全項目 0 を返す', async () => {
    rpc.mockResolvedValue({ data: null, error: null })
    expect(await getGlobalStatsSummary()).toEqual({
      totalUsers: 0,
      totalPointsDistributed: 0,
      totalFeedback: 0,
      newFeedback: 0,
    })
  })

  it('RPC エラーを AppError に変換する', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: 'DB_ERROR', message: 'boom' } })
    await expect(getGlobalStatsSummary()).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'グローバルサマリーの取得に失敗しました',
    })
  })
})
