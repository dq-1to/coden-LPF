import { beforeEach, describe, expect, it, vi } from 'vitest'
import { awardPoints } from '../pointService'

const rpc = vi.fn()

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    rpc: (...args: unknown[]) => rpc(...args),
  },
}))

describe('awardPoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('正のポイントで award_points_tx RPC を呼び出す', async () => {
    rpc.mockResolvedValue({ error: null })

    await awardPoints(10, 'step_complete')

    expect(rpc).toHaveBeenCalledWith('award_points_tx', {
      p_amount: 10,
      p_reason: 'step_complete',
    })
  })

  it('RPC が成功した場合は何も返さない（void）', async () => {
    rpc.mockResolvedValue({ error: null })

    const result = await awardPoints(50, 'daily_challenge')

    expect(result).toBeUndefined()
  })

  it('amount が 0 の場合は RPC を呼ばずに例外を投げる', async () => {
    await expect(awardPoints(0, 'step_complete')).rejects.toThrow(
      'amount must be a positive integer',
    )
    expect(rpc).not.toHaveBeenCalled()
  })

  it('amount が負の場合は RPC を呼ばずに例外を投げる', async () => {
    await expect(awardPoints(-1, 'step_complete')).rejects.toThrow(
      'amount must be a positive integer',
    )
    expect(rpc).not.toHaveBeenCalled()
  })

  it('amount が小数の場合は RPC を呼ばずに例外を投げる', async () => {
    await expect(awardPoints(1.5, 'step_complete')).rejects.toThrow(
      'amount must be a positive integer',
    )
    expect(rpc).not.toHaveBeenCalled()
  })

  it('Supabase エラーをアプリ共通エラーに変換する', async () => {
    rpc.mockResolvedValue({
      error: { code: 'DB_ERROR', message: 'connection error' },
    })

    await expect(awardPoints(10, 'step_complete')).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'ポイントの付与に失敗しました',
    })
  })
})
