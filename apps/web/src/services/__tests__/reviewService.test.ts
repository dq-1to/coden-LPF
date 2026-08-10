import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '../../lib/supabaseClient'
import {
  getDueCount,
  getOpenCount,
  listDue,
  listOpen,
  pickForDaily,
  recordCorrectAnswer,
  recordWrongAnswer,
  resetReviewItemSchedule,
  type ReviewItem,
} from '../reviewService'

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

const mockFrom = vi.mocked(supabase.from)
const mockRpc = vi.mocked(supabase.rpc)
const userId = '00000000-0000-0000-0000-000000000001'
const now = new Date('2026-06-03T12:00:00.000Z')

function makeMaybeSingleQuery(result: unknown) {
  const query = {
    eq: vi.fn(() => query),
    is: vi.fn(() => query),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }

  return query
}

function makeInsertQuery(result: unknown) {
  const terminal = {
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  const select = vi.fn(() => terminal)
  const insert = vi.fn(() => ({ select }))

  return { insert, select, terminal }
}

function makeUpdateQuery(result: unknown) {
  const terminal = {
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  const chain = {
    eq: vi.fn(() => chain),
    select: vi.fn(() => terminal),
  }
  const update = vi.fn(() => chain)

  return { update, chain, terminal }
}

function makeThenableFilterQuery(result: unknown) {
  const query = {
    eq: vi.fn(() => query),
    lte: vi.fn(() => query),
    then: vi.fn((resolve, reject) => Promise.resolve(result).then(resolve, reject)),
  }

  return query
}

function makeReviewItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    id: 'review-1',
    user_id: userId,
    step_id: 'usestate-basic',
    mode: 'daily',
    question_id: 'daily-1',
    expected: 'setCount',
    user_input: 'wrong',
    status: 'open',
    created_at: '2026-06-03T12:00:00.000Z',
    resolved_at: null,
    review_stage: 0,
    next_review_at: '2026-06-03T12:00:00.000Z',
    last_reviewed_at: null,
    ...overrides,
  }
}

function mockListOpenRows(rows: ReviewItem[]) {
  const query = {
    eq: vi.fn(() => query),
    lte: vi.fn(() => query),
    order: vi.fn(() => query),
    limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
  }
  const select = vi.fn(() => query)

  mockFrom.mockReturnValueOnce({ select } as unknown as ReturnType<typeof supabase.from>)
  return { query, select }
}

describe('reviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(now)
    mockRpc.mockResolvedValue({ data: true, error: null } as never)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('recordWrongAnswer は未登録の誤答を open item として保存する', async () => {
    const findQuery = makeMaybeSingleQuery({ data: null, error: null })
    const insertQuery = makeInsertQuery({ data: { id: 'review-1' }, error: null })

    mockFrom
      .mockReturnValueOnce({ select: vi.fn(() => findQuery) } as unknown as ReturnType<typeof supabase.from>)
      .mockReturnValueOnce({ insert: insertQuery.insert } as unknown as ReturnType<typeof supabase.from>)

    await recordWrongAnswer({
      userId,
      stepId: 'usestate-basic',
      mode: 'practice',
      questionId: 'practice-1',
      expected: 'setCount',
      userInput: 'count = count + 1',
    })

    expect(insertQuery.insert).toHaveBeenCalledWith({
      user_id: userId,
      step_id: 'usestate-basic',
      mode: 'practice',
      question_id: 'practice-1',
      expected: 'setCount',
      user_input: 'count = count + 1',
      status: 'open',
      resolved_at: null,
      review_stage: 0,
      next_review_at: now.toISOString(),
      last_reviewed_at: now.toISOString(),
    })
  })

  it('recordWrongAnswer は登録済み item を stage 0 の即日 due に戻す', async () => {
    const findQuery = makeMaybeSingleQuery({
      data: { id: 'review-1', status: 'open', review_stage: 2 },
      error: null,
    })
    const updateQuery = makeUpdateQuery({ data: { id: 'review-1' }, error: null })

    mockFrom
      .mockReturnValueOnce({ select: vi.fn(() => findQuery) } as unknown as ReturnType<typeof supabase.from>)
      .mockReturnValueOnce({ update: updateQuery.update } as unknown as ReturnType<typeof supabase.from>)

    await recordWrongAnswer({
      userId,
      stepId: 'usestate-basic',
      mode: 'test',
      expected: 'useState',
      userInput: 'useEffect',
    })

    expect(updateQuery.update).toHaveBeenCalledWith({
      expected: 'useState',
      user_input: 'useEffect',
      status: 'open',
      resolved_at: null,
      review_stage: 0,
      next_review_at: now.toISOString(),
      last_reviewed_at: now.toISOString(),
    })
  })

  it('recordCorrectAnswer は期日判定つきRPCへ委譲し、クライアントで stage を計算しない', async () => {
    await recordCorrectAnswer({
      userId,
      stepId: 'usestate-basic',
      mode: 'practice',
      questionId: 'practice-1',
    })

    expect(mockRpc).toHaveBeenCalledWith('advance_review_item_if_due', {
      p_step_id: 'usestate-basic',
      p_mode: 'practice',
      p_question_id: 'practice-1',
    })
    // stage / next_review_at の決定は DB 側なので、テーブルへ直接触らない
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('recordCorrectAnswer は userId を RPC へ渡さない（本人判定は auth.uid()）', async () => {
    await recordCorrectAnswer({
      userId,
      stepId: 'usestate-basic',
      mode: 'test',
    })

    const [, args] = mockRpc.mock.calls[0] as [string, Record<string, unknown>]
    expect(Object.keys(args)).toEqual(['p_step_id', 'p_mode', 'p_question_id'])
    expect(JSON.stringify(args)).not.toContain(userId)
  })

  it('recordCorrectAnswer は questionId 未指定を null として渡す', async () => {
    await recordCorrectAnswer({
      userId,
      stepId: 'usestate-basic',
      mode: 'challenge',
      questionId: '  ',
    })

    expect(mockRpc).toHaveBeenCalledWith('advance_review_item_if_due', {
      p_step_id: 'usestate-basic',
      p_mode: 'challenge',
      p_question_id: null,
    })
  })

  it('recordCorrectAnswer は RPC エラーを既存のエラー形式へ変換する', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'boom' } } as never)

    await expect(
      recordCorrectAnswer({ userId, stepId: 'usestate-basic', mode: 'practice' }),
    ).rejects.toThrow('復習アイテムの更新に失敗しました')
  })

  it('resetReviewItemSchedule はスケジュールリセットRPCを呼ぶ', async () => {
    await resetReviewItemSchedule({
      userId,
      stepId: 'usestate-basic',
      mode: 'test',
      questionId: 'test-q1',
    })

    expect(mockRpc).toHaveBeenCalledWith('reset_review_item_schedule', {
      p_step_id: 'usestate-basic',
      p_mode: 'test',
      p_question_id: 'test-q1',
    })
    // expected / user_input を上書きしないため、テーブル更新は行わない
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('resetReviewItemSchedule は RPC エラーを既存のエラー形式へ変換する', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'boom' } } as never)

    await expect(
      resetReviewItemSchedule({ userId, stepId: 'usestate-basic', mode: 'test' }),
    ).rejects.toThrow('復習アイテムの更新に失敗しました')
  })

  it('getOpenCount は open item の件数を返す', async () => {
    const countQuery = makeThenableFilterQuery({ count: 3, error: null })
    const select = vi.fn(() => countQuery)

    mockFrom.mockReturnValueOnce({ select } as unknown as ReturnType<typeof supabase.from>)

    await expect(getOpenCount(userId)).resolves.toBe(3)
    expect(select).toHaveBeenCalledWith('id', { count: 'exact', head: true })
  })

  it('listOpen は open item を古い順に指定件数返す', async () => {
    const rows: ReviewItem[] = [makeReviewItem()]
    const { query } = mockListOpenRows(rows)

    await expect(listOpen(userId, 5)).resolves.toEqual(rows)
    expect(query.order).toHaveBeenCalledWith('created_at', { ascending: true })
    expect(query.limit).toHaveBeenCalledWith(5)
  })

  it('listDue は期日到来 item を予定日時の古い順に返す', async () => {
    const rows: ReviewItem[] = [makeReviewItem()]
    const { query } = mockListOpenRows(rows)

    await expect(listDue(userId, 5, now)).resolves.toEqual(rows)
    expect(query.lte).toHaveBeenCalledWith('next_review_at', now.toISOString())
    expect(query.order).toHaveBeenCalledWith('next_review_at', { ascending: true })
    expect(query.limit).toHaveBeenCalledWith(5)
  })

  it('getDueCount は open かつ期日到来 item の件数を返す', async () => {
    const countQuery = makeThenableFilterQuery({ count: 2, error: null })
    const select = vi.fn(() => countQuery)

    mockFrom.mockReturnValueOnce({ select } as unknown as ReturnType<typeof supabase.from>)

    await expect(getDueCount(userId, now)).resolves.toBe(2)
    expect(countQuery.eq).toHaveBeenNthCalledWith(1, 'user_id', userId)
    expect(countQuery.eq).toHaveBeenNthCalledWith(2, 'status', 'open')
    expect(countQuery.lte).toHaveBeenCalledWith('next_review_at', now.toISOString())
  })

  it('pickForDaily は完了済みStepに一致する最初の due item を返す', async () => {
    const rows: ReviewItem[] = [
      makeReviewItem({
        id: 'review-1',
        step_id: 'conditional',
        mode: 'test',
        question_id: 'test-q1',
      }),
      makeReviewItem({
        id: 'review-2',
        step_id: 'events',
        mode: 'practice',
        question_id: 'practice-q1',
      }),
    ]
    const { query } = mockListOpenRows(rows)

    await expect(pickForDaily(userId, new Set(['events']), 25)).resolves.toEqual(rows[1])
    expect(query.lte).toHaveBeenCalledWith('next_review_at', now.toISOString())
    expect(query.limit).toHaveBeenCalledWith(25)
  })

  it('pickForDaily は完了済みStepに一致する due item がなければ null を返す', async () => {
    const rows: ReviewItem[] = [
      makeReviewItem({
        id: 'review-1',
        step_id: 'conditional',
      }),
    ]
    mockListOpenRows(rows)

    await expect(pickForDaily(userId, new Set(['events']))).resolves.toBeNull()
  })
})
