import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '../../lib/supabaseClient'
import {
  getDueCount,
  getNextReviewSchedule,
  getOpenCount,
  listDue,
  listOpen,
  pickForDaily,
  recordCorrectAnswer,
  recordWrongAnswer,
  type ReviewItem,
} from '../reviewService'

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const mockFrom = vi.mocked(supabase.from)
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
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([
    {
      label: '誤答は任意の stage から stage 0 に戻す',
      currentStage: 3,
      isCorrect: false,
      reviewStage: 0,
      intervalDays: 0,
      status: 'open' as const,
    },
    {
      label: 'stage 0 の正解は翌日へ送る',
      currentStage: 0,
      isCorrect: true,
      reviewStage: 1,
      intervalDays: 1,
      status: 'open' as const,
    },
    {
      label: 'stage 1 の正解は3日後へ送る',
      currentStage: 1,
      isCorrect: true,
      reviewStage: 2,
      intervalDays: 3,
      status: 'open' as const,
    },
    {
      label: 'stage 2 の正解は7日後へ送る',
      currentStage: 2,
      isCorrect: true,
      reviewStage: 3,
      intervalDays: 7,
      status: 'open' as const,
    },
    {
      label: 'stage 3 の正解は完了にする',
      currentStage: 3,
      isCorrect: true,
      reviewStage: 4,
      intervalDays: null,
      status: 'resolved' as const,
    },
  ])('getNextReviewSchedule: $label', ({
    currentStage,
    isCorrect,
    reviewStage,
    intervalDays,
    status,
  }) => {
    const result = getNextReviewSchedule(currentStage, isCorrect)

    expect(result).toEqual({
      reviewStage,
      nextReviewAt: intervalDays === null
        ? null
        : new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000).toISOString(),
      status,
    })
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

  it('recordCorrectAnswer は stage 0 を翌日へ進める', async () => {
    const findQuery = makeMaybeSingleQuery({
      data: { id: 'review-1', status: 'open', review_stage: 0 },
      error: null,
    })
    const updateQuery = makeUpdateQuery({ data: { id: 'review-1' }, error: null })

    mockFrom
      .mockReturnValueOnce({ select: vi.fn(() => findQuery) } as unknown as ReturnType<typeof supabase.from>)
      .mockReturnValueOnce({ update: updateQuery.update } as unknown as ReturnType<typeof supabase.from>)

    await recordCorrectAnswer({
      userId,
      stepId: 'usestate-basic',
      mode: 'practice',
      questionId: 'practice-1',
    })

    expect(updateQuery.update).toHaveBeenCalledWith({
      status: 'open',
      review_stage: 1,
      next_review_at: '2026-06-04T12:00:00.000Z',
      last_reviewed_at: now.toISOString(),
      resolved_at: null,
    })
  })

  it('recordCorrectAnswer は stage 2 を7日後へ進める', async () => {
    const findQuery = makeMaybeSingleQuery({
      data: { id: 'review-1', status: 'open', review_stage: 2 },
      error: null,
    })
    const updateQuery = makeUpdateQuery({ data: { id: 'review-1' }, error: null })

    mockFrom
      .mockReturnValueOnce({ select: vi.fn(() => findQuery) } as unknown as ReturnType<typeof supabase.from>)
      .mockReturnValueOnce({ update: updateQuery.update } as unknown as ReturnType<typeof supabase.from>)

    await recordCorrectAnswer({
      userId,
      stepId: 'usestate-basic',
      mode: 'test',
    })

    expect(updateQuery.update).toHaveBeenCalledWith({
      status: 'open',
      review_stage: 3,
      next_review_at: '2026-06-10T12:00:00.000Z',
      last_reviewed_at: now.toISOString(),
      resolved_at: null,
    })
  })

  it('recordCorrectAnswer は stage 3 を resolved にして次回日時を更新しない', async () => {
    const findQuery = makeMaybeSingleQuery({
      data: { id: 'review-1', status: 'open', review_stage: 3 },
      error: null,
    })
    const updateQuery = makeUpdateQuery({ data: { id: 'review-1' }, error: null })

    mockFrom
      .mockReturnValueOnce({ select: vi.fn(() => findQuery) } as unknown as ReturnType<typeof supabase.from>)
      .mockReturnValueOnce({ update: updateQuery.update } as unknown as ReturnType<typeof supabase.from>)

    await recordCorrectAnswer({
      userId,
      stepId: 'usestate-basic',
      mode: 'challenge',
      questionId: null,
    })

    expect(updateQuery.update).toHaveBeenCalledWith({
      status: 'resolved',
      review_stage: 4,
      last_reviewed_at: now.toISOString(),
      resolved_at: now.toISOString(),
    })
  })

  it('recordCorrectAnswer は resolved item なら何もしない', async () => {
    const findQuery = makeMaybeSingleQuery({
      data: { id: 'review-1', status: 'resolved', review_stage: 4 },
      error: null,
    })

    mockFrom.mockReturnValueOnce({ select: vi.fn(() => findQuery) } as unknown as ReturnType<typeof supabase.from>)

    await recordCorrectAnswer({
      userId,
      stepId: 'usestate-basic',
      mode: 'challenge',
    })

    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  it('recordCorrectAnswer は対象 item がなければ何もしない', async () => {
    const findQuery = makeMaybeSingleQuery({ data: null, error: null })

    mockFrom.mockReturnValueOnce({ select: vi.fn(() => findQuery) } as unknown as ReturnType<typeof supabase.from>)

    await recordCorrectAnswer({
      userId,
      stepId: 'usestate-basic',
      mode: 'practice',
    })

    expect(mockFrom).toHaveBeenCalledTimes(1)
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
