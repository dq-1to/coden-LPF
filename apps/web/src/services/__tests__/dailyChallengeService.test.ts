import { vi, describe, it, expect, beforeEach } from 'vitest'
import { supabase } from '../../lib/supabaseClient'
import { awardPoints } from '../pointService'
import {
  getTodayJst,
  getCurrentWeekDates,
  selectDailyQuestion,
  getTodayChallenge,
  submitDailyAnswer,
  getWeeklyStatus,
} from '../dailyChallengeService'

// Supabase クライアントをモック
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

// pointService をモック
vi.mock('../pointService', () => ({
  awardPoints: vi.fn(),
}))

const mockFrom = vi.mocked(supabase.from)
const mockAwardPoints = vi.mocked(awardPoints)

// ─── 純粋関数テスト ──────────────────────────────────────

describe('getTodayJst', () => {
  it('UTC 時刻が JST に変換されて日付が返される', () => {
    // UTC 15:00 = JST 翌日 00:00 → 日付が変わる境界
    const utcMidnight = new Date('2026-03-30T15:00:00Z')
    expect(getTodayJst(utcMidnight)).toBe('2026-03-31')
  })

  it('UTC 14:59 は JST 23:59 で前日のまま', () => {
    const before = new Date('2026-03-30T14:59:00Z')
    expect(getTodayJst(before)).toBe('2026-03-30')
  })

  it('引数なしで呼び出しても文字列が返る', () => {
    const result = getTodayJst()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('getCurrentWeekDates', () => {
  it('月曜日を週の先頭として7日分を返す', () => {
    // 2026-03-30 は月曜日（JST）
    const monday = new Date('2026-03-30T00:00:00Z')
    const dates = getCurrentWeekDates(monday)
    expect(dates).toHaveLength(7)
    expect(dates[0]).toBe('2026-03-30')
    expect(dates[6]).toBe('2026-04-05')
  })

  it('水曜日を基点にした場合も月曜始まりの7日を返す', () => {
    // 2026-04-01 は水曜
    const wednesday = new Date('2026-04-01T00:00:00Z')
    const dates = getCurrentWeekDates(wednesday)
    expect(dates[0]).toBe('2026-03-30') // 月曜
    expect(dates[6]).toBe('2026-04-05') // 日曜
  })

  it('日曜日を基点にした場合も正しい月曜始まりの7日を返す', () => {
    // 2026-04-05 は日曜
    const sunday = new Date('2026-04-05T00:00:00Z')
    const dates = getCurrentWeekDates(sunday)
    expect(dates[0]).toBe('2026-03-30') // 月曜
    expect(dates[6]).toBe('2026-04-05') // 日曜
  })
})

describe('selectDailyQuestion', () => {
  it('完了済みステップが空なら undefined を返す', () => {
    const result = selectDailyQuestion(new Set(), '2026-03-30')
    expect(result).toBeUndefined()
  })

  it('完了済みステップに対応する問題が返される', () => {
    const completedStepIds = new Set(['usestate-basic'])
    const result = selectDailyQuestion(completedStepIds, '2026-03-30')
    expect(result).toBeDefined()
    expect(result?.stepId).toBe('usestate-basic')
  })

  it('同じ日付・同じ完了ステップなら同じ問題が返される（決定論的）', () => {
    const completedStepIds = new Set(['usestate-basic', 'events', 'conditional'])
    const r1 = selectDailyQuestion(completedStepIds, '2026-03-30')
    const r2 = selectDailyQuestion(completedStepIds, '2026-03-30')
    expect(r1?.id).toBe(r2?.id)
  })

  it('日付が異なれば問題が変わりうる', () => {
    const completedStepIds = new Set([
      'usestate-basic', 'events', 'conditional', 'lists',
      'useeffect', 'forms', 'usecontext', 'usereducer',
    ])
    const results = new Set(
      ['2026-03-30', '2026-03-31', '2026-04-01', '2026-04-02'].map(
        (d) => selectDailyQuestion(completedStepIds, d)?.id,
      ),
    )
    // 4日間で少なくとも2種類以上の問題が選ばれる
    expect(results.size).toBeGreaterThan(1)
  })

  it('完了済みステップに含まれないステップの問題は選ばれない', () => {
    const completedStepIds = new Set(['usestate-basic'])
    // 100 日分チェック
    const ids = Array.from({ length: 100 }, (_, i) => {
      const d = new Date(Date.UTC(2026, 0, 1) + i * 86400000).toISOString().slice(0, 10)
      return selectDailyQuestion(completedStepIds, d)?.stepId
    })
    const uniqueStepIds = new Set(ids)
    expect(uniqueStepIds.has('events')).toBe(false)
    expect(uniqueStepIds.has('usestate-basic')).toBe(true)
  })
})

// ─── DB 関数テスト ───────────────────────────────────────

describe('getTodayChallenge', () => {
  const userId = 'user-1'
  const completedStepIds = new Set(['usestate-basic'])

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未完了の場合は question を返す', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const result = await getTodayChallenge(userId, completedStepIds)
    expect(result.alreadyCompleted).toBe(false)
    expect(result.question).toBeDefined()
    expect(result.question?.stepId).toBe('usestate-basic')
  })

  it('完了済みの場合は alreadyCompleted: true を返す', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                challenge_id: 'usestate-basic-daily-0',
                completed: true,
                points_earned: 20,
                completed_at: '2026-03-30T10:00:00Z',
              },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const result = await getTodayChallenge(userId, completedStepIds)
    expect(result.alreadyCompleted).toBe(true)
    expect(result.question).toBeNull()
    expect(result.pointsEarned).toBe(20)
  })

  it('完了済みステップがない場合は question: null を返す', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const result = await getTodayChallenge(userId, new Set())
    expect(result.question).toBeNull()
    expect(result.alreadyCompleted).toBe(false)
  })
})

describe('submitDailyAnswer', () => {
  const userId = 'user-1'
  const dateStr = '2026-03-30'
  const question = {
    id: 'usestate-basic-daily-0',
    stepId: 'usestate-basic',
    type: 'blank' as const,
    prompt: 'テスト問題',
    answer: 'setCount',
    hint: 'ヒント',
    explanation: '解説',
  }

  // streak クエリで返すデータを各テストで上書き可能
  let currentStreakData: { challenge_date: string; completed: boolean }[] = []

  function makeStreakData(days: number) {
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(dateStr + 'T00:00:00Z')
      d.setUTCDate(d.getUTCDate() - i)
      return { challenge_date: d.toISOString().slice(0, 10), completed: true }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    currentStreakData = []

    // upsert（保存）と select（streak取得）を同じオブジェクトで対応
    mockFrom.mockImplementation(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: currentStreakData, error: null }),
      }),
    } as unknown as ReturnType<typeof supabase.from>))
    mockAwardPoints.mockResolvedValue()
  })

  it('正解の場合は isCorrect: true と 20pt を返す', async () => {
    const result = await submitDailyAnswer(userId, question, 'setCount', dateStr)
    expect(result.isCorrect).toBe(true)
    expect(result.pointsEarned).toBe(20)
    expect(mockAwardPoints).toHaveBeenCalledWith(20, 'デイリーチャレンジ正解')
  })

  it('不正解の場合は isCorrect: false と 0pt を返す', async () => {
    const result = await submitDailyAnswer(userId, question, 'wrongAnswer', dateStr)
    expect(result.isCorrect).toBe(false)
    expect(result.pointsEarned).toBe(0)
    expect(mockAwardPoints).not.toHaveBeenCalled()
  })

  it('前後の空白を無視して正解判定する', async () => {
    const result = await submitDailyAnswer(userId, question, '  setCount  ', dateStr)
    expect(result.isCorrect).toBe(true)
  })

  it('大文字・小文字を区別せずに判定する', async () => {
    const result = await submitDailyAnswer(userId, question, 'SETCOUNT', dateStr)
    expect(result.isCorrect).toBe(true)
  })

  it('正解時に explanation が返される', async () => {
    const result = await submitDailyAnswer(userId, question, 'setCount', dateStr)
    expect(result.explanation).toBe('解説')
    expect(result.correctAnswer).toBe('setCount')
  })

  it('7日連続正解でボーナス 50pt が付与される', async () => {
    currentStreakData = makeStreakData(7)

    await submitDailyAnswer(userId, question, 'setCount', dateStr)

    expect(mockAwardPoints).toHaveBeenCalledWith(20, 'デイリーチャレンジ正解')
    expect(mockAwardPoints).toHaveBeenCalledWith(50, 'デイリー7日連続ボーナス')
  })

  it('14日連続でも 50pt ボーナスが付与される', async () => {
    currentStreakData = makeStreakData(14)

    await submitDailyAnswer(userId, question, 'setCount', dateStr)

    expect(mockAwardPoints).toHaveBeenCalledWith(50, 'デイリー14日連続ボーナス')
  })

  it('6日連続ではボーナスが付与されない', async () => {
    currentStreakData = makeStreakData(6)

    await submitDailyAnswer(userId, question, 'setCount', dateStr)

    expect(mockAwardPoints).not.toHaveBeenCalledWith(50, expect.any(String))
  })

  it('不正解ではストリーク確認せずボーナスも付与されない', async () => {
    await submitDailyAnswer(userId, question, 'wrongAnswer', dateStr)

    expect(mockAwardPoints).not.toHaveBeenCalled()
    // from() は upsert の1回のみ呼ばれる（streak query なし）
    expect(mockFrom).toHaveBeenCalledTimes(1)
  })
})

describe('getWeeklyStatus', () => {
  const userId = 'user-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('7日分のエントリが返される', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const result = await getWeeklyStatus(userId)
    expect(result).toHaveLength(7)
  })

  it('完了済みの日付が completed: true になる', async () => {
    // 2026-03-30 を月曜として固定
    const monday = new Date('2026-03-30T00:00:00Z')

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({
              data: [{ challenge_date: '2026-03-30', completed: true }],
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const result = await getWeeklyStatus(userId, monday)
    const monday_entry = result.find((e) => e.date === '2026-03-30')
    expect(monday_entry?.completed).toBe(true)
    const tuesday_entry = result.find((e) => e.date === '2026-03-31')
    expect(tuesday_entry?.completed).toBe(false)
  })
})
