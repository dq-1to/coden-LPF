import { vi, describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useLearningStep } from '../useLearningStep'

// コンテキストフックをモック
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/contexts/LearningContext', () => ({
  useLearningContext: vi.fn(),
}))

vi.mock('@/contexts/AchievementContext', () => ({
  useAchievementContext: vi.fn(),
}))

// サービスをモック
vi.mock('@/services/progressService', () => ({
  getStepProgress: vi.fn(),
  updateModeCompletion: vi.fn(),
  upsertProgress: vi.fn(),
}))

vi.mock('@/services/eventService', () => ({
  trackLearningEvent: vi.fn(),
}))

vi.mock('@/services/statsService', () => ({
  recordStudyActivity: vi.fn(),
}))

vi.mock('@/services/pointService', () => ({
  awardPoints: vi.fn(),
}))

import { useAuth } from '@/contexts/AuthContext'
import { useLearningContext } from '@/contexts/LearningContext'
import { useAchievementContext } from '@/contexts/AchievementContext'
import { getStepProgress, upsertProgress } from '@/services/progressService'
import { trackLearningEvent } from '@/services/eventService'

const mockUseAuth = vi.mocked(useAuth)
const mockUseLearningContext = vi.mocked(useLearningContext)
const mockUseAchievementContext = vi.mocked(useAchievementContext)
const mockGetStepProgress = vi.mocked(getStepProgress)
const mockUpsertProgress = vi.mocked(upsertProgress)
const mockTrackLearningEvent = vi.mocked(trackLearningEvent)

const mockUser = { id: 'test-user', email: 'test@example.com', user_metadata: {} }

beforeEach(() => {
  vi.clearAllMocks()

  mockUseAuth.mockReturnValue({
    user: mockUser,
    signOut: vi.fn(),
    signIn: vi.fn(),
    isLoadingAuth: false,
  } as unknown as ReturnType<typeof useAuth>)

  mockUseLearningContext.mockReturnValue({
    stats: null,
    allStepProgress: [],
    completedStepIds: new Set<string>(),
    completedStepsCount: 99,
    isLoadingStats: false,
    refreshStats: vi.fn().mockResolvedValue(undefined),
  })

  mockUseAchievementContext.mockReturnValue({
    refreshAchievements: vi.fn().mockResolvedValue(undefined),
    unlockedAchievements: [],
  } as unknown as ReturnType<typeof useAchievementContext>)

  mockGetStepProgress.mockResolvedValue(null)
  mockUpsertProgress.mockResolvedValue(undefined)
})

describe('useLearningStep', () => {
  it('既知の stepId に対して step オブジェクトを返す', () => {
    const { result } = renderHook(() => useLearningStep('usestate-basic'))

    expect(result.current.step).toBeDefined()
    expect(result.current.step?.id).toBe('usestate-basic')
  })

  it('未知の stepId に対して step が undefined になる', () => {
    const { result } = renderHook(() => useLearningStep('unknown-step'))

    expect(result.current.step).toBeUndefined()
  })

  it('初期状態では isStepCompleted が false', () => {
    const { result } = renderHook(() => useLearningStep('usestate-basic'))

    expect(result.current.isStepCompleted).toBe(false)
  })

  it('初期状態では syncMessage が null', () => {
    const { result } = renderHook(() => useLearningStep('usestate-basic'))

    expect(result.current.syncMessage).toBeNull()
  })

  it('全ステップが実装済みのため既知ステップは isUnavailableStep が false', () => {
    const { result } = renderHook(() => useLearningStep('api-error-loading'))

    expect(result.current.isUnavailableStep).toBe(false)
  })

  it('handleModeComplete は進捗保存後に mode_completed イベントを記録する', async () => {
    const { result } = renderHook(() => useLearningStep('usestate-basic'))

    await waitFor(() => {
      expect(mockGetStepProgress).toHaveBeenCalledWith('test-user', 'usestate-basic')
    })

    mockGetStepProgress.mockResolvedValueOnce({
      user_id: 'test-user',
      step_id: 'usestate-basic',
      read_done: true,
      practice_done: false,
      test_done: false,
      challenge_done: false,
      updated_at: '2026-06-05T00:00:00.000Z',
      completed_at: null,
    })

    await act(async () => {
      await result.current.handleModeComplete('read')
    })

    expect(mockUpsertProgress).toHaveBeenCalledWith('test-user', 'usestate-basic', { read_done: true })
    expect(mockTrackLearningEvent).toHaveBeenCalledWith({
      userId: 'test-user',
      eventType: 'mode_completed',
      stepId: 'usestate-basic',
      mode: 'read',
      courseId: 'react-fundamentals',
      payload: {
        stepCompleted: false,
      },
    })
  })
})
