import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '../../lib/supabaseClient'
import {
  getOpenCount,
  listOpen,
  recordWrongAnswer,
  resolveReviewItem,
  type ReviewItem,
} from '../reviewService'

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const mockFrom = vi.mocked(supabase.from)
const userId = '00000000-0000-0000-0000-000000000001'

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

function makeThenableEqQuery(result: unknown) {
  const query = {
    eq: vi.fn(() => query),
    then: vi.fn((resolve, reject) => Promise.resolve(result).then(resolve, reject)),
  }

  return query
}

describe('reviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
    })
  })

  it('recordWrongAnswer は登録済み item を再 open する', async () => {
    const findQuery = makeMaybeSingleQuery({ data: { id: 'review-1' }, error: null })
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
    })
  })

  it('resolveReviewItem は対象 item があれば resolved にする', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-03T12:00:00.000Z'))

    const findQuery = makeMaybeSingleQuery({ data: { id: 'review-1' }, error: null })
    const updateQuery = makeUpdateQuery({ data: { id: 'review-1' }, error: null })

    mockFrom
      .mockReturnValueOnce({ select: vi.fn(() => findQuery) } as unknown as ReturnType<typeof supabase.from>)
      .mockReturnValueOnce({ update: updateQuery.update } as unknown as ReturnType<typeof supabase.from>)

    await resolveReviewItem({
      userId,
      stepId: 'usestate-basic',
      mode: 'challenge',
      questionId: null,
    })

    expect(updateQuery.update).toHaveBeenCalledWith({
      status: 'resolved',
      resolved_at: '2026-06-03T12:00:00.000Z',
    })

    vi.useRealTimers()
  })

  it('resolveReviewItem は対象 item がなければ何もしない', async () => {
    const findQuery = makeMaybeSingleQuery({ data: null, error: null })

    mockFrom.mockReturnValueOnce({ select: vi.fn(() => findQuery) } as unknown as ReturnType<typeof supabase.from>)

    await resolveReviewItem({
      userId,
      stepId: 'usestate-basic',
      mode: 'practice',
    })

    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  it('getOpenCount は open item の件数を返す', async () => {
    const countQuery = makeThenableEqQuery({ count: 3, error: null })
    const select = vi.fn(() => countQuery)

    mockFrom.mockReturnValueOnce({ select } as unknown as ReturnType<typeof supabase.from>)

    await expect(getOpenCount(userId)).resolves.toBe(3)
    expect(select).toHaveBeenCalledWith('id', { count: 'exact', head: true })
  })

  it('listOpen は open item を古い順に指定件数返す', async () => {
    const rows: ReviewItem[] = [
      {
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
      },
    ]
    const query = {
      eq: vi.fn(() => query),
      order: vi.fn(() => query),
      limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
    }
    const select = vi.fn(() => query)

    mockFrom.mockReturnValueOnce({ select } as unknown as ReturnType<typeof supabase.from>)

    await expect(listOpen(userId, 5)).resolves.toEqual(rows)
    expect(query.order).toHaveBeenCalledWith('created_at', { ascending: true })
    expect(query.limit).toHaveBeenCalledWith(5)
  })
})
