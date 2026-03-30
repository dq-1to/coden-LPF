import { vi, describe, it, expect, beforeEach } from 'vitest'
import { supabase } from '../../lib/supabaseClient'
import { awardPoints } from '../pointService'
import {
  getPointsForDifficulty,
  judgeCode,
  getProblemProgressMap,
  submitDoctorSolution,
} from '../codeDoctorService'
import type { CodeDoctorProblem } from '../../content/code-doctor/types'

vi.mock('../../lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))
vi.mock('../pointService', () => ({ awardPoints: vi.fn() }))

const mockFrom = vi.mocked(supabase.from)
const mockAwardPoints = vi.mocked(awardPoints)

// ─── 純粋関数テスト ──────────────────────────────────────

describe('getPointsForDifficulty', () => {
  it('beginner は 15 pt を返す', () => {
    expect(getPointsForDifficulty('beginner')).toBe(15)
  })
  it('intermediate は 30 pt を返す', () => {
    expect(getPointsForDifficulty('intermediate')).toBe(30)
  })
  it('advanced は 50 pt を返す', () => {
    expect(getPointsForDifficulty('advanced')).toBe(50)
  })
})

describe('judgeCode', () => {
  const problem = {
    requiredKeywords: ['key=', 'map('],
    ngKeywords: ['<li>item</li>'],
  }

  it('必須キーワードをすべて含みNGワードがなければ passed: true', () => {
    const result = judgeCode('items.map((i) => <li key={i}>{i}</li>)', problem)
    expect(result.passed).toBe(true)
    expect(result.missingKeywords).toHaveLength(0)
    expect(result.foundNgKeywords).toHaveLength(0)
  })

  it('必須キーワードが不足していれば passed: false', () => {
    const result = judgeCode('items.map((i) => <li>{i}</li>)', problem)
    expect(result.passed).toBe(false)
    expect(result.missingKeywords).toContain('key=')
  })

  it('NGキーワードが含まれていれば passed: false', () => {
    const result = judgeCode('<li>item</li> key= map(', problem)
    expect(result.passed).toBe(false)
    expect(result.foundNgKeywords).toContain('<li>item</li>')
  })

  it('大文字小文字を区別しない', () => {
    const p = { requiredKeywords: ['Key='], ngKeywords: [] }
    const result = judgeCode('KEY=value', p)
    expect(result.passed).toBe(true)
  })
})

// ─── DB 関数テスト ───────────────────────────────────────

const sampleProblem: CodeDoctorProblem = {
  id: 'cd-beginner-001',
  category: 'react',
  difficulty: 'beginner',
  title: 'テスト問題',
  description: 'テスト',
  buggyCode: '<li>{item}</li>',
  hint: 'ヒント',
  requiredKeywords: ['key='],
  ngKeywords: [],
  explanation: '解説',
}

describe('getProblemProgressMap', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('進捗なしの場合は空の Map を返す', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const result = await getProblemProgressMap('user-1')
    expect(result.size).toBe(0)
  })

  it('解決済み問題が Map に含まれる', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { problem_id: 'cd-beginner-001', solved: true, attempts: 2, solved_at: '2026-03-30T10:00:00Z' },
          ],
          error: null,
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const result = await getProblemProgressMap('user-1')
    expect(result.get('cd-beginner-001')?.solved).toBe(true)
    expect(result.get('cd-beginner-001')?.attempts).toBe(2)
  })
})

describe('submitDoctorSolution', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    } as unknown as ReturnType<typeof supabase.from>)
    mockAwardPoints.mockResolvedValue()
  })

  it('正解の場合は passed: true と対応ポイントを返す', async () => {
    const result = await submitDoctorSolution('user-1', sampleProblem, '<li key={item.id}>{item}</li>')
    expect(result.passed).toBe(true)
    expect(result.pointsEarned).toBe(15)
    expect(mockAwardPoints).toHaveBeenCalledWith('user-1', 15, 'コードドクター正解（beginner）')
  })

  it('不正解の場合は passed: false で 0 pt', async () => {
    const result = await submitDoctorSolution('user-1', sampleProblem, '<li>{item}</li>')
    expect(result.passed).toBe(false)
    expect(result.pointsEarned).toBe(0)
    expect(mockAwardPoints).not.toHaveBeenCalled()
  })

  it('不足キーワードが missingKeywords に含まれる', async () => {
    const result = await submitDoctorSolution('user-1', sampleProblem, '<li>{item}</li>')
    expect(result.missingKeywords).toContain('key=')
  })

  it('正解時に explanation が返される', async () => {
    const result = await submitDoctorSolution('user-1', sampleProblem, 'key= <li>')
    expect(result.explanation).toBe('解説')
  })

  it('advanced 問題の正解は 50 pt', async () => {
    const advancedProblem: CodeDoctorProblem = { ...sampleProblem, id: 'cd-advanced-001', difficulty: 'advanced' }
    const result = await submitDoctorSolution('user-1', advancedProblem, 'key=')
    expect(result.pointsEarned).toBe(50)
    expect(mockAwardPoints).toHaveBeenCalledWith('user-1', 50, 'コードドクター正解（advanced）')
  })
})
