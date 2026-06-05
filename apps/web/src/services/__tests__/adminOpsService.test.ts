import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MAX_GRANT_POINTS_AMOUNT,
  MAX_GRANT_POINTS_REASON_LENGTH,
  grantBadge,
  grantPoints,
} from '../adminOpsService'

const rpc = vi.fn()

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    rpc: (...args: unknown[]) => rpc(...args),
  },
}))

const TARGET = '11111111-1111-1111-1111-111111111111'

describe('grantPoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('admin_grant_points RPC を正しい引数で呼び出す', async () => {
    rpc.mockResolvedValue({ error: null })
    await grantPoints({ targetUserId: TARGET, amount: 100, reason: 'キャンペーン' })
    expect(rpc).toHaveBeenCalledWith('admin_grant_points', {
      p_target_user_id: TARGET,
      p_amount: 100,
      p_reason: 'キャンペーン',
    })
  })

  it('reason の前後空白は trim して送る', async () => {
    rpc.mockResolvedValue({ error: null })
    await grantPoints({ targetUserId: TARGET, amount: 10, reason: '  hi  ' })
    expect(rpc).toHaveBeenCalledWith('admin_grant_points', expect.objectContaining({ p_reason: 'hi' }))
  })

  it('不正な UUID は RPC を呼ばずに例外を投げる', async () => {
    await expect(
      grantPoints({ targetUserId: 'not-uuid', amount: 10, reason: 'x' }),
    ).rejects.toThrow('targetUserId must be a valid UUID')
    expect(rpc).not.toHaveBeenCalled()
  })

  it('amount が 0 以下は例外を投げる', async () => {
    await expect(
      grantPoints({ targetUserId: TARGET, amount: 0, reason: 'x' }),
    ).rejects.toThrow('amount must be a positive integer')
    await expect(
      grantPoints({ targetUserId: TARGET, amount: -1, reason: 'x' }),
    ).rejects.toThrow('amount must be a positive integer')
    expect(rpc).not.toHaveBeenCalled()
  })

  it('amount が上限超過は例外を投げる', async () => {
    await expect(
      grantPoints({
        targetUserId: TARGET,
        amount: MAX_GRANT_POINTS_AMOUNT + 1,
        reason: 'x',
      }),
    ).rejects.toThrow(`amount must be at most ${MAX_GRANT_POINTS_AMOUNT}`)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('空の reason は例外を投げる', async () => {
    await expect(
      grantPoints({ targetUserId: TARGET, amount: 10, reason: '   ' }),
    ).rejects.toThrow('reason must not be empty')
    expect(rpc).not.toHaveBeenCalled()
  })

  it('reason が上限超過は例外を投げる', async () => {
    await expect(
      grantPoints({
        targetUserId: TARGET,
        amount: 10,
        reason: 'a'.repeat(MAX_GRANT_POINTS_REASON_LENGTH + 1),
      }),
    ).rejects.toThrow(`reason must be at most ${MAX_GRANT_POINTS_REASON_LENGTH} characters`)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('Supabase エラーを AppError に変換する', async () => {
    rpc.mockResolvedValue({ error: { code: 'DB_ERROR', message: 'rls denied' } })
    await expect(
      grantPoints({ targetUserId: TARGET, amount: 10, reason: 'x' }),
    ).rejects.toMatchObject({ name: 'AppError', userMessage: 'ポイントの付与に失敗しました' })
  })
})

describe('grantBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('admin_grant_badge RPC を正しい引数で呼び出す', async () => {
    rpc.mockResolvedValue({ error: null })
    await grantBadge({ targetUserId: TARGET, badgeId: 'first-step' })
    expect(rpc).toHaveBeenCalledWith('admin_grant_badge', {
      p_target_user_id: TARGET,
      p_badge_id: 'first-step',
    })
  })

  it('未知のバッジ ID は例外を投げる', async () => {
    await expect(
      // @ts-expect-error - 意図的に不正な値を渡す
      grantBadge({ targetUserId: TARGET, badgeId: 'unknown-badge' }),
    ).rejects.toThrow('unknown badge_id')
    expect(rpc).not.toHaveBeenCalled()
  })

  it('不正な UUID は例外を投げる', async () => {
    await expect(
      grantBadge({ targetUserId: 'not-uuid', badgeId: 'first-step' }),
    ).rejects.toThrow('targetUserId must be a valid UUID')
    expect(rpc).not.toHaveBeenCalled()
  })

  it('Supabase エラーを AppError に変換する', async () => {
    rpc.mockResolvedValue({ error: { code: 'DB_ERROR', message: 'rls denied' } })
    await expect(
      grantBadge({ targetUserId: TARGET, badgeId: 'first-step' }),
    ).rejects.toMatchObject({ name: 'AppError', userMessage: 'バッジの付与に失敗しました' })
  })
})
