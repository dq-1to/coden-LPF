import { vi, describe, it, expect, beforeEach } from 'vitest'
import { supabase } from '../../lib/supabaseClient'
import { awardPoints } from '../pointService'
import {
  getPointsForDifficulty,
  judgeAnswer,
  getReadingProgressMap,
  submitReading,
} from '../codeReadingService'
import type { CodeReadingProblem } from '../../content/code-reading/types'

vi.mock('../../lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))
vi.mock('../pointService', () => ({ awardPoints: vi.fn() }))

const mockFrom = vi.mocked(supabase.from)
const mockAwardPoints = vi.mocked(awardPoints)

// ─── サンプルデータ ──────────────────────────────────────

const sampleProblem: CodeReadingProblem = {
  id: 'cr-001',
  difficulty: 'basic',
  title: 'カスタムフック',
  description: 'テスト用',
  codeSnippet: 'const x = 1',
  language: 'typescript',
  questions: [
    {
      id: 'q1',
      text: '設問1',
      choices: ['A', 'B', 'C', 'D'],
      correctIndex: 1,
      explanation: '解説1',
    },
    {
      id: 'q2',
      text: '設問2',
      choices: ['A', 'B', 'C', 'D'],
      correctIndex: 2,
      explanation: '解説2',
    },
    {
      id: 'q3',
      text: '設問3',
      choices: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      explanation: '解説3',
    },
  ],
}

// ─── getPointsForDifficulty テスト ───────────────────────

describe('getPointsForDifficulty', () => {
  it('basic は 10 pt を返す', () => {
    expect(getPointsForDifficulty('basic')).toBe(10)
  })
  it('intermediate は 20 pt を返す', () => {
    expect(getPointsForDifficulty('intermediate')).toBe(20)
  })
  it('advanced は 30 pt を返す', () => {
    expect(getPointsForDifficulty('advanced')).toBe(30)
  })
})

// ─── judgeAnswer テスト ──────────────────────────────────

describe('judgeAnswer', () => {
  it('選択インデックスが correctIndex と一致すれば true', () => {
    expect(judgeAnswer(1, { correctIndex: 1 })).toBe(true)
  })
  it('選択インデックスが correctIndex と異なれば false', () => {
    expect(judgeAnswer(0, { correctIndex: 1 })).toBe(false)
  })
  it('correctIndex が 0 のとき選択 0 は true', () => {
    expect(judgeAnswer(0, { correctIndex: 0 })).toBe(true)
  })
})

// ─── getReadingProgressMap テスト ────────────────────────

describe('getReadingProgressMap', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('進捗なしの場合は空の Map を返す', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const result = await getReadingProgressMap('user-1')
    expect(result.size).toBe(0)
  })

  it('completed 進捗が Map に含まれる', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              problem_id: 'cr-001',
              correct_count: 3,
              total_count: 3,
              completed: true,
              completed_at: '2026-03-30T10:00:00Z',
            },
          ],
          error: null,
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const result = await getReadingProgressMap('user-1')
    expect(result.get('cr-001')?.completed).toBe(true)
    expect(result.get('cr-001')?.correctCount).toBe(3)
  })

  it('部分正解の進捗が Map に含まれる', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              problem_id: 'cr-002',
              correct_count: 2,
              total_count: 3,
              completed: false,
              completed_at: null,
            },
          ],
          error: null,
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const result = await getReadingProgressMap('user-1')
    expect(result.get('cr-002')?.completed).toBe(false)
    expect(result.get('cr-002')?.correctCount).toBe(2)
  })
})

// ─── submitReading テスト ────────────────────────────────

describe('submitReading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    } as unknown as ReturnType<typeof supabase.from>)
    mockAwardPoints.mockResolvedValue()
  })

  it('全問正解 + 初回完了で allCorrect: true かつ 10 pt を返す', async () => {
    const answers = [1, 2, 0] // 全問正解
    const result = await submitReading('user-1', sampleProblem, answers, false)
    expect(result.allCorrect).toBe(true)
    expect(result.pointsEarned).toBe(10)
    expect(mockAwardPoints).toHaveBeenCalledWith('user-1', 10, 'コードリーディング完了（カスタムフック）')
  })

  it('全問正解でも previousCompleted: true の場合はポイントを付与しない', async () => {
    const answers = [1, 2, 0]
    const result = await submitReading('user-1', sampleProblem, answers, true)
    expect(result.allCorrect).toBe(true)
    expect(result.pointsEarned).toBe(0)
    expect(mockAwardPoints).not.toHaveBeenCalled()
  })

  it('部分正解の場合は allCorrect: false で 0 pt', async () => {
    const answers = [1, 0, 0] // q2 が不正解
    const result = await submitReading('user-1', sampleProblem, answers, false)
    expect(result.allCorrect).toBe(false)
    expect(result.pointsEarned).toBe(0)
    expect(mockAwardPoints).not.toHaveBeenCalled()
  })

  it('questionResults の長さが問題数と一致する', async () => {
    const answers = [1, 2, 0]
    const result = await submitReading('user-1', sampleProblem, answers, false)
    expect(result.questionResults).toHaveLength(sampleProblem.questions.length)
  })

  it('correctCount が正解数と一致する', async () => {
    const answers = [1, 0, 0] // q1 と q3 が正解、q2 が不正解
    const result = await submitReading('user-1', sampleProblem, answers, false)
    expect(result.correctCount).toBe(2)
  })

  it('questionResults に各設問の isCorrect と explanation が含まれる', async () => {
    const answers = [1, 2, 0]
    const result = await submitReading('user-1', sampleProblem, answers, false)
    expect(result.questionResults[0].isCorrect).toBe(true)
    expect(result.questionResults[0].explanation).toBe('解説1')
    expect(result.questionResults[1].isCorrect).toBe(true)
    expect(result.questionResults[2].isCorrect).toBe(true)
  })
})
