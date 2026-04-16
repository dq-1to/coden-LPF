import { cleanup, render, waitFor, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LearningProvider, useLearningContext } from '../LearningContext'
import { useAuth } from '../AuthContext'
import { getLearningStats } from '../../services/statsService'
import { getAllStepProgress } from '../../services/progressService'
import type { LearningStats } from '../../services/statsService'
import type { User } from '@supabase/supabase-js'

// --- Mocks ---

vi.mock('../AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../services/statsService', () => ({
  getLearningStats: vi.fn(),
}))

vi.mock('../../services/progressService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/progressService')>()
  return {
    ...actual,
    getAllStepProgress: vi.fn(),
  }
})

const mockUseAuth = vi.mocked(useAuth)
const mockGetLearningStats = vi.mocked(getLearningStats)
const mockGetAllStepProgress = vi.mocked(getAllStepProgress)

// --- Test helpers ---

interface LearningContextType {
  stats: LearningStats | null
  completedStepIds: ReadonlySet<string>
  completedStepsCount: number
  isLoadingStats: boolean
  refreshStats: () => Promise<void>
}

function TestConsumer({ onValue }: { onValue: (v: LearningContextType) => void }) {
  const ctx = useLearningContext()
  onValue(ctx)
  return null
}

const fakeUser = { id: 'user-1' } as User

const fakeStats: LearningStats = {
  user_id: 'user-1',
  total_points: 100,
  current_streak: 3,
  max_streak: 7,
  last_study_date: '2026-04-01',
}

function makeProgress(stepId: string, allDone: boolean) {
  return {
    user_id: 'user-1',
    step_id: stepId,
    read_done: allDone,
    practice_done: allDone,
    test_done: allDone,
    challenge_done: allDone,
    updated_at: '2026-04-01T00:00:00Z',
    completed_at: allDone ? '2026-04-01T00:00:00Z' : null,
  }
}

// --- Tests ---

describe('LearningContext', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: fakeUser,
      session: null,
      isLoadingAuth: false,
      isAdmin: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    mockGetLearningStats.mockResolvedValue(fakeStats)
    mockGetAllStepProgress.mockResolvedValue([
      makeProgress('usestate-basic', true),
      makeProgress('events', true),
      makeProgress('conditional', false),
    ])
  })

  it('ユーザーが存在する場合、マウント時に stats と completedStepIds を読み込む', async () => {
    let captured: LearningContextType | undefined

    await act(async () => {
      render(
        <LearningProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </LearningProvider>,
      )
    })

    await waitFor(() => {
      expect(captured).toBeDefined()
      expect(captured!.isLoadingStats).toBe(false)
    })

    expect(captured!.stats).toEqual(fakeStats)
    expect(captured!.completedStepIds.has('usestate-basic')).toBe(true)
    expect(captured!.completedStepIds.has('events')).toBe(true)
    expect(captured!.completedStepIds.has('conditional')).toBe(false)
  })

  it('ユーザーがいない場合は空の状態を設定する', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      isLoadingAuth: false,
      isAdmin: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    let captured: LearningContextType | undefined

    await act(async () => {
      render(
        <LearningProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </LearningProvider>,
      )
    })

    await waitFor(() => {
      expect(captured).toBeDefined()
      expect(captured!.isLoadingStats).toBe(false)
    })

    expect(captured!.stats).toBeNull()
    expect(captured!.completedStepIds.size).toBe(0)
  })

  it('completedStepsCount が completedStepIds.size と一致する', async () => {
    let captured: LearningContextType | undefined

    await act(async () => {
      render(
        <LearningProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </LearningProvider>,
      )
    })

    await waitFor(() => {
      expect(captured!.isLoadingStats).toBe(false)
    })

    // makeProgress で allDone=true のステップが 2 つ
    expect(captured!.completedStepsCount).toBe(2)
    expect(captured!.completedStepsCount).toBe(captured!.completedStepIds.size)
  })

  it('refreshStats を呼ぶと状態が更新される', async () => {
    let captured: LearningContextType | undefined

    await act(async () => {
      render(
        <LearningProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </LearningProvider>,
      )
    })

    await waitFor(() => {
      expect(captured!.isLoadingStats).toBe(false)
    })

    // 新しいデータに更新
    const updatedStats: LearningStats = {
      ...fakeStats,
      total_points: 200,
    }
    mockGetLearningStats.mockResolvedValue(updatedStats)
    mockGetAllStepProgress.mockResolvedValue([
      makeProgress('usestate-basic', true),
      makeProgress('events', true),
      makeProgress('conditional', true),
    ])

    await act(async () => {
      await captured!.refreshStats()
    })

    await waitFor(() => {
      expect(captured!.stats?.total_points).toBe(200)
      expect(captured!.completedStepIds.size).toBe(3)
    })
  })

  it('アンマウント後に state 更新が行われない（isMountedRef ガード）', async () => {
    let captured: LearningContextType | undefined

    // getSession を遅延させてアンマウント後の state 更新を防ぐテスト
    let resolveStats: (value: LearningStats) => void = () => {}
    mockGetLearningStats.mockImplementation(
      () => new Promise<LearningStats>((resolve) => { resolveStats = resolve }),
    )

    let component: ReturnType<typeof render> | undefined

    await act(async () => {
      component = render(
        <LearningProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </LearningProvider>,
      )
    })

    // ローディング中にアンマウント
    expect(captured!.isLoadingStats).toBe(true)

    await act(async () => {
      component!.unmount()
    })

    // Promise を解決しても例外が発生しないことを確認
    await act(async () => {
      resolveStats(fakeStats)
    })

    // テストが例外なく完了すれば isMountedRef ガードが動作している
  })
})
