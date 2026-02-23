import { vi, describe, it, expect, beforeEach } from 'vitest'
import { supabase } from '../../lib/supabaseClient'
import { getAllStepProgress } from '../progressService'
import { getLearningStats } from '../statsService'
import { checkAndUnlockAchievements } from '../achievementService'
import type { LearningStats } from '../statsService'

// Supabase クライアントをモック
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

// 外部依存サービスをモック
vi.mock('../progressService', () => ({
  getAllStepProgress: vi.fn(),
}))

vi.mock('../statsService', () => ({
  getLearningStats: vi.fn(),
}))

const mockFrom = vi.mocked(supabase.from)
const mockGetAllStepProgress = vi.mocked(getAllStepProgress)
const mockGetLearningStats = vi.mocked(getLearningStats)

const defaultStats: LearningStats = {
  user_id: 'test-user',
  total_points: 0,
  current_streak: 0,
  max_streak: 0,
  last_study_date: null,
}

/** step_id に対して全モード完了の進捗データを生成する */
function makeCompletedProgress(stepId: string) {
  return {
    user_id: 'test-user',
    step_id: stepId,
    read_done: true,
    practice_done: true,
    test_done: true,
    challenge_done: true,
    updated_at: '',
    completed_at: null,
  }
}

describe('checkAndUnlockAchievements', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // デフォルト: 既存バッジなし、INSERT 成功
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    } as unknown as ReturnType<typeof supabase.from>)

    // デフォルト: ステップ未完了、ストリーク 0
    mockGetAllStepProgress.mockResolvedValue([])
    mockGetLearningStats.mockResolvedValue(defaultStats)
  })

  it('コースの一部ステップのみ完了してもコース完了バッジは付与されない', async () => {
    // course-3 の 4 ステップのうち 2 ステップのみ完了（course-3-complete は付与されない）
    const partialStepIds = ['performance', 'testing']
    mockGetAllStepProgress.mockResolvedValue(partialStepIds.map(makeCompletedProgress))

    const unlocked = await checkAndUnlockAchievements('test-user')

    expect(unlocked).not.toContain('course-3-complete')
  })

  it('course-3 の全ステップ完了で course-3-complete バッジが付与される', async () => {
    const course3StepIds = ['custom-hooks', 'api-fetch', 'performance', 'testing']
    mockGetAllStepProgress.mockResolvedValue(course3StepIds.map(makeCompletedProgress))

    const unlocked = await checkAndUnlockAchievements('test-user')

    expect(unlocked).toContain('course-3-complete')
  })

  it('isImplemented: true のコース（course-1）が全完了したら course-1-complete バッジが付与される', async () => {
    const course1StepIds = ['usestate-basic', 'events', 'conditional', 'lists']
    mockGetAllStepProgress.mockResolvedValue(course1StepIds.map(makeCompletedProgress))

    const unlocked = await checkAndUnlockAchievements('test-user')

    expect(unlocked).toContain('course-1-complete')
  })

  it('1 ステップ以上完了で first-step バッジが付与される', async () => {
    mockGetAllStepProgress.mockResolvedValue([makeCompletedProgress('usestate-basic')])

    const unlocked = await checkAndUnlockAchievements('test-user')

    expect(unlocked).toContain('first-step')
  })

  it('challenge_done の実績があれば first-challenge バッジが付与される', async () => {
    mockGetAllStepProgress.mockResolvedValue([makeCompletedProgress('usestate-basic')])

    const unlocked = await checkAndUnlockAchievements('test-user')

    expect(unlocked).toContain('first-challenge')
  })

  it('current_streak >= 3 で streak-3 バッジが付与される', async () => {
    mockGetLearningStats.mockResolvedValue({ ...defaultStats, current_streak: 3 })

    const unlocked = await checkAndUnlockAchievements('test-user')

    expect(unlocked).toContain('streak-3')
  })

  it('total_points >= 500 で pt-500 バッジが付与される', async () => {
    mockGetLearningStats.mockResolvedValue({ ...defaultStats, total_points: 500 })

    const unlocked = await checkAndUnlockAchievements('test-user')

    expect(unlocked).toContain('pt-500')
  })

  it('既に解禁済みのバッジは再付与されない', async () => {
    // getUnlockedAchievements が 'first-step' を返すよう mock
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ badge_id: 'first-step' }],
          error: null,
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    } as unknown as ReturnType<typeof supabase.from>)

    mockGetAllStepProgress.mockResolvedValue([makeCompletedProgress('usestate-basic')])

    const unlocked = await checkAndUnlockAchievements('test-user')

    expect(unlocked).not.toContain('first-step')
  })
})
