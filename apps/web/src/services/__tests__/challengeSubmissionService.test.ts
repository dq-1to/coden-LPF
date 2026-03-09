import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createChallengeSubmission, getRecentChallengeSubmissions } from '../challengeSubmissionService'

const insert = vi.fn()
const select = vi.fn()
const single = vi.fn()
const from = vi.fn()
const eq = vi.fn()
const order = vi.fn()
const limit = vi.fn()

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => from(...args),
  },
}))

describe('createChallengeSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    from.mockReturnValue({ insert })
    insert.mockReturnValue({ select })
    select.mockReturnValue({ single })
    eq.mockReturnValue({ eq, order })
    order.mockReturnValue({ limit })
  })

  it('challenge_submissions に提出コード・合否・一致キーワードを保存する', async () => {
    const savedRow = {
      id: 'submission-1',
      user_id: 'user-1',
      step_id: 'usestate-basic',
      code: 'const ok = true',
      is_passed: true,
      matched_keywords: ['useState', 'onClick'],
      submitted_at: '2026-03-09T00:00:00.000Z',
    }
    single.mockResolvedValue({ data: savedRow, error: null })

    const result = await createChallengeSubmission({
      user_id: 'user-1',
      step_id: 'usestate-basic',
      code: 'const ok = true',
      is_passed: true,
      matched_keywords: ['useState', 'onClick'],
    })

    expect(from).toHaveBeenCalledWith('challenge_submissions')
    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      step_id: 'usestate-basic',
      code: 'const ok = true',
      is_passed: true,
      matched_keywords: ['useState', 'onClick'],
    })
    expect(select).toHaveBeenCalledWith('id, user_id, step_id, code, is_passed, matched_keywords, submitted_at')
    expect(result).toEqual(savedRow)
  })

  it('Supabase エラーをアプリ共通エラーに変換する', async () => {
    single.mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    })

    await expect(
      createChallengeSubmission({
        user_id: 'user-1',
        step_id: 'usestate-basic',
        code: 'const ok = true',
        is_passed: false,
        matched_keywords: [],
      }),
    ).rejects.toMatchObject({
      name: 'AppError',
      code: 'DB_UNIQUE_VIOLATION',
      userMessage: 'Challenge の提出履歴保存に失敗しました',
    })
  })

  it('直近の提出履歴を submitted_at 降順で取得する', async () => {
    const rows = [
      {
        id: 'submission-2',
        user_id: 'user-1',
        step_id: 'usestate-basic',
        code: 'latest',
        is_passed: false,
        matched_keywords: [],
        submitted_at: '2026-03-09T11:00:00.000Z',
      },
    ]
    from.mockReturnValue({ select })
    select.mockReturnValue({ eq })
    limit.mockResolvedValue({ data: rows, error: null })

    const result = await getRecentChallengeSubmissions('user-1', 'usestate-basic', 3)

    expect(from).toHaveBeenCalledWith('challenge_submissions')
    expect(eq).toHaveBeenNthCalledWith(1, 'user_id', 'user-1')
    expect(eq).toHaveBeenNthCalledWith(2, 'step_id', 'usestate-basic')
    expect(order).toHaveBeenCalledWith('submitted_at', { ascending: false })
    expect(limit).toHaveBeenCalledWith(3)
    expect(result).toEqual(rows)
  })
})
