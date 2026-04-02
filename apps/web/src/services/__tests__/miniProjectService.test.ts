import { vi, describe, it, expect, beforeEach } from 'vitest'
import { supabase } from '../../lib/supabaseClient'
import { awardPoints } from '../pointService'
import {
  judgeProject,
  calcStatus,
  getProjectProgressMap,
  submitProject,
} from '../miniProjectService'
import type { MiniProject } from '../../content/mini-projects/types'

vi.mock('../../lib/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))
vi.mock('../pointService', () => ({ awardPoints: vi.fn() }))

const mockFrom = vi.mocked(supabase.from)
const mockAwardPoints = vi.mocked(awardPoints)

// ─── サンプルデータ ──────────────────────────────────────

const sampleProject: MiniProject = {
  id: 'todo-app',
  difficulty: 'beginner',
  title: 'Todo App',
  description: 'テスト用',
  keyElements: ['useState'],
  milestones: [
    {
      id: 'milestone-1',
      title: 'useState 管理',
      description: 'useState でタスクを管理',
      requiredKeywords: ['usestate(', 'settasks('],
    },
    {
      id: 'milestone-2',
      title: 'フォーム追加',
      description: 'フォームでタスクを追加',
      requiredKeywords: ['addtask', 'setinput('],
    },
  ],
  initialCode: '// initial',
}

// ─── judgeProject テスト ─────────────────────────────────

describe('judgeProject', () => {
  it('全マイルストーンのキーワードを含むコードは全 passed: true', () => {
    const code = 'useState( setTasks( addTask setInput('
    const results = judgeProject(code, sampleProject)
    expect(results).toHaveLength(2)
    expect(results[0]!.passed).toBe(true)
    expect(results[1]!.passed).toBe(true)
  })

  it('一部マイルストーンのキーワードのみ含む場合は部分的に passed', () => {
    const code = 'useState( setTasks('
    const results = judgeProject(code, sampleProject)
    expect(results[0]!.passed).toBe(true)
    expect(results[1]!.passed).toBe(false)
  })

  it('キーワードを含まないコードは全 passed: false', () => {
    const code = 'const x = 1'
    const results = judgeProject(code, sampleProject)
    expect(results.every((r) => !r.passed)).toBe(true)
  })

  it('大文字小文字を区別しない', () => {
    const code = 'USESTATE( SETTASKS('
    const results = judgeProject(code, sampleProject)
    expect(results[0]!.passed).toBe(true)
  })
})

// ─── calcStatus テスト ───────────────────────────────────

describe('calcStatus', () => {
  it('全通過なら completed', () => {
    const results = [
      { milestoneId: 'milestone-1', passed: true },
      { milestoneId: 'milestone-2', passed: true },
    ]
    expect(calcStatus(results)).toBe('completed')
  })

  it('一部通過なら in_progress', () => {
    const results = [
      { milestoneId: 'milestone-1', passed: true },
      { milestoneId: 'milestone-2', passed: false },
    ]
    expect(calcStatus(results)).toBe('in_progress')
  })

  it('0通過なら not_started', () => {
    const results = [
      { milestoneId: 'milestone-1', passed: false },
      { milestoneId: 'milestone-2', passed: false },
    ]
    expect(calcStatus(results)).toBe('not_started')
  })
})

// ─── getProjectProgressMap テスト ────────────────────────

describe('getProjectProgressMap', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('進捗なしの場合は空の Map を返す', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const result = await getProjectProgressMap('user-1')
    expect(result.size).toBe(0)
  })

  it('completed 進捗が Map に含まれる', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { project_id: 'todo-app', status: 'completed', code: 'code here', completed_at: '2026-03-30T10:00:00Z' },
          ],
          error: null,
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const result = await getProjectProgressMap('user-1')
    expect(result.get('todo-app')?.status).toBe('completed')
    expect(result.get('todo-app')?.completedAt).toBe('2026-03-30T10:00:00Z')
  })

  it('in_progress 進捗が Map に含まれる', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { project_id: 'timer-app', status: 'in_progress', code: 'partial', completed_at: null },
          ],
          error: null,
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>)

    const result = await getProjectProgressMap('user-1')
    expect(result.get('timer-app')?.status).toBe('in_progress')
    expect(result.get('timer-app')?.code).toBe('partial')
  })
})

// ─── submitProject テスト ────────────────────────────────

describe('submitProject', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    } as unknown as ReturnType<typeof supabase.from>)
    mockAwardPoints.mockResolvedValue()
  })

  it('全マイルストーン通過で allPassed: true かつ 100 Pt を返す', async () => {
    const code = 'useState( setTasks( addTask setInput('
    const result = await submitProject('user-1', sampleProject, code, 'not_started')
    expect(result.allPassed).toBe(true)
    expect(result.pointsEarned).toBe(100)
    expect(mockAwardPoints).toHaveBeenCalledWith(100, 'ミニプロジェクト完了（Todo App）')
  })

  it('初回 completed 時のみポイントを付与する（previousStatus: not_started）', async () => {
    const code = 'useState( setTasks( addTask setInput('
    const result = await submitProject('user-1', sampleProject, code, 'not_started')
    expect(result.pointsEarned).toBe(100)
    expect(mockAwardPoints).toHaveBeenCalledTimes(1)
  })

  it('既に completed の場合はポイントを付与しない（previousStatus: completed）', async () => {
    const code = 'useState( setTasks( addTask setInput('
    const result = await submitProject('user-1', sampleProject, code, 'completed')
    expect(result.pointsEarned).toBe(0)
    expect(mockAwardPoints).not.toHaveBeenCalled()
  })

  it('一部通過の場合は 0 Pt で allPassed: false', async () => {
    const code = 'useState( setTasks('
    const result = await submitProject('user-1', sampleProject, code, 'not_started')
    expect(result.allPassed).toBe(false)
    expect(result.pointsEarned).toBe(0)
    expect(mockAwardPoints).not.toHaveBeenCalled()
  })

  it('milestoneResults の長さがマイルストーン数と一致する', async () => {
    const code = 'useState( setTasks('
    const result = await submitProject('user-1', sampleProject, code, 'not_started')
    expect(result.milestoneResults).toHaveLength(sampleProject.milestones.length)
  })
})
