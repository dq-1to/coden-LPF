import { vi, describe, it, expect, beforeEach } from 'vitest'
import { supabase } from '../../lib/supabaseClient'
import { awardPoints } from '../pointService'
import {
  selectQuestions,
  getTopicProgress,
  getAllProgress,
  submitAnswer,
} from '../baseNookService'
import type { BaseNookQuestion } from '../../content/base-nook/types'

vi.mock('../../lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))
vi.mock('../pointService', () => ({ awardPoints: vi.fn() }))

const mockFrom = vi.mocked(supabase.from)
const mockAwardPoints = vi.mocked(awardPoints)

// ─── サンプルデータ ──────────────────────────────────────

const q1: BaseNookQuestion = {
  id: 'q-1',
  text: '問題1',
  choices: [
    { label: 'A' },
    { label: 'B' },
    { label: 'C' },
    { label: 'D' },
  ],
  correctIndex: 0,
  explanation: '解説1',
}
const q2: BaseNookQuestion = { ...q1, id: 'q-2', text: '問題2' }
const q3: BaseNookQuestion = { ...q1, id: 'q-3', text: '問題3' }
const q4: BaseNookQuestion = { ...q1, id: 'q-4', text: '問題4' }
const q5: BaseNookQuestion = { ...q1, id: 'q-5', text: '問題5' }

const pool = [q1, q2, q3, q4, q5]

// ─── selectQuestions テスト ────────────────────────────────

describe('selectQuestions', () => {
  it('未正解の問題を優先して選択する', () => {
    const solvedIds = new Set(['q-1', 'q-2', 'q-3'])
    const result = selectQuestions(solvedIds, pool, 3)

    expect(result).toHaveLength(3)
    // 未正解は q-4, q-5 の2問 → 必ず含まれる
    const ids = result.map((q) => q.id)
    expect(ids).toContain('q-4')
    expect(ids).toContain('q-5')
  })

  it('全問正解済みでも count 分返す', () => {
    const solvedIds = new Set(['q-1', 'q-2', 'q-3', 'q-4', 'q-5'])
    const result = selectQuestions(solvedIds, pool, 3)

    expect(result).toHaveLength(3)
  })

  it('未正解が count 以上あれば正解済みを含まない', () => {
    const solvedIds = new Set<string>()
    const result = selectQuestions(solvedIds, pool, 3)

    expect(result).toHaveLength(3)
    // 全て未正解プールから選ばれる
    for (const q of result) {
      expect(solvedIds.has(q.id)).toBe(false)
    }
  })

  it('pool が count より少ない場合は pool 全数を返す', () => {
    const solvedIds = new Set<string>()
    const result = selectQuestions(solvedIds, [q1, q2], 5)

    expect(result).toHaveLength(2)
  })

  it('空の pool では空配列を返す', () => {
    const result = selectQuestions(new Set(), [], 3)
    expect(result).toHaveLength(0)
  })
})

// ─── getTopicProgress テスト ──────────────────────────────

describe('getTopicProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('正解済み問題の Set を返す', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ question_id: 'q-1' }, { question_id: 'q-3' }],
            error: null,
          }),
        }),
      }),
    })
    mockFrom.mockReturnValue({ select: mockSelect } as never)

    const result = await getTopicProgress('00000000-0000-0000-0000-000000000001', 'javascript')

    expect(result).toEqual(new Set(['q-1', 'q-3']))
    expect(mockFrom).toHaveBeenCalledWith('base_nook_progress')
  })

  it('エラー時は例外を投げる', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'DB error' },
          }),
        }),
      }),
    })
    mockFrom.mockReturnValue({ select: mockSelect } as never)

    await expect(
      getTopicProgress('00000000-0000-0000-0000-000000000001', 'javascript'),
    ).rejects.toThrow()
  })
})

// ─── getAllProgress テスト ────────────────────────────────

describe('getAllProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('トピック別の正解数サマリーを返す', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { topic_id: 'javascript', question_id: 'q-1' },
            { topic_id: 'javascript', question_id: 'q-2' },
            { topic_id: 'jsx', question_id: 'q-1' },
          ],
          error: null,
        }),
      }),
    })
    mockFrom.mockReturnValue({ select: mockSelect } as never)

    const result = await getAllProgress('00000000-0000-0000-0000-000000000001')

    expect(result).toEqual(
      expect.arrayContaining([
        { topicId: 'javascript', correctCount: 2 },
        { topicId: 'jsx', correctCount: 1 },
      ]),
    )
  })
})

// ─── submitAnswer テスト ─────────────────────────────────

describe('submitAnswer', () => {
  const userId = '00000000-0000-0000-0000-000000000001'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('初回正答で pointsAwarded: true を返しポイントを付与する', async () => {
    // 既存レコードなし
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    })
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom
      .mockReturnValueOnce({ select: mockSelect } as never)
      .mockReturnValueOnce({ upsert: mockUpsert } as never)

    const result = await submitAnswer(userId, 'javascript', 'q-1', true)

    expect(result.pointsAwarded).toBe(true)
    expect(mockAwardPoints).toHaveBeenCalledWith(5, 'base_nook')
  })

  it('既に正解済みの場合はポイントを付与しない', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { correct: true },
            error: null,
          }),
        }),
      }),
    })
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom
      .mockReturnValueOnce({ select: mockSelect } as never)
      .mockReturnValueOnce({ upsert: mockUpsert } as never)

    const result = await submitAnswer(userId, 'javascript', 'q-1', true)

    expect(result.pointsAwarded).toBe(false)
    expect(mockAwardPoints).not.toHaveBeenCalled()
  })

  it('不正解の場合はポイントを付与しない', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    })
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom
      .mockReturnValueOnce({ select: mockSelect } as never)
      .mockReturnValueOnce({ upsert: mockUpsert } as never)

    const result = await submitAnswer(userId, 'javascript', 'q-1', false)

    expect(result.pointsAwarded).toBe(false)
    expect(mockAwardPoints).not.toHaveBeenCalled()
  })

  it('upsert エラー時は例外を投げる', async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    })
    const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'DB error' } })
    mockFrom
      .mockReturnValueOnce({ select: mockSelect } as never)
      .mockReturnValueOnce({ upsert: mockUpsert } as never)

    await expect(submitAnswer(userId, 'javascript', 'q-1', true)).rejects.toThrow()
  })
})
