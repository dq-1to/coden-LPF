import { cleanup, render, waitFor, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AchievementProvider, useAchievementContext } from '../AchievementContext'
import { useAuth } from '../AuthContext'
import { checkAndUnlockAchievements, getUnlockedAchievements } from '../../services/achievementService'
import type { BadgeId } from '../../services/achievementService'
import type { User } from '@supabase/supabase-js'

// --- Mocks ---

vi.mock('../AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../services/achievementService', () => ({
  checkAndUnlockAchievements: vi.fn(),
  getUnlockedAchievements: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)
const mockCheckAndUnlock = vi.mocked(checkAndUnlockAchievements)
const mockGetUnlocked = vi.mocked(getUnlockedAchievements)

// --- Test helpers ---

interface AchievementContextType {
  unlockedBadgeIds: BadgeId[]
  refreshAchievements: () => Promise<void>
  isLoadingAchievements: boolean
  newlyUnlockedBadge: BadgeId | null
  dismissBadgeToast: () => void
}

function TestConsumer({ onValue }: { onValue: (v: AchievementContextType) => void }) {
  const ctx = useAchievementContext()
  onValue(ctx)
  return null
}

const fakeUser = { id: 'user-1' } as User

// --- Tests ---

describe('AchievementContext', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: fakeUser,
      session: null,
      isLoadingAuth: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    mockCheckAndUnlock.mockResolvedValue([])
    mockGetUnlocked.mockResolvedValue(['first-step'] as BadgeId[])
  })

  it('ユーザーが存在する場合、マウント時にバッジを読み込む', async () => {
    let captured: AchievementContextType | undefined

    await act(async () => {
      render(
        <AchievementProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </AchievementProvider>,
      )
    })

    await waitFor(() => {
      expect(captured).toBeDefined()
      expect(captured!.isLoadingAchievements).toBe(false)
    })

    expect(captured!.unlockedBadgeIds).toEqual(['first-step'])
    expect(mockCheckAndUnlock).toHaveBeenCalledWith('user-1')
    expect(mockGetUnlocked).toHaveBeenCalledWith('user-1')
  })

  it('ユーザーがいない場合は空の状態を設定する', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      isLoadingAuth: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    let captured: AchievementContextType | undefined

    await act(async () => {
      render(
        <AchievementProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </AchievementProvider>,
      )
    })

    await waitFor(() => {
      expect(captured).toBeDefined()
      expect(captured!.isLoadingAchievements).toBe(false)
    })

    expect(captured!.unlockedBadgeIds).toEqual([])
    expect(captured!.newlyUnlockedBadge).toBeNull()
  })

  it('新規解除バッジがあるとトーストに表示する', async () => {
    mockCheckAndUnlock.mockResolvedValue(['streak-3'] as BadgeId[])
    mockGetUnlocked.mockResolvedValue(['first-step', 'streak-3'] as BadgeId[])

    let captured: AchievementContextType | undefined

    await act(async () => {
      render(
        <AchievementProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </AchievementProvider>,
      )
    })

    await waitFor(() => {
      expect(captured!.isLoadingAchievements).toBe(false)
    })

    await waitFor(() => {
      expect(captured!.newlyUnlockedBadge).toBe('streak-3')
    })
  })

  it('dismissBadgeToast でトーストをクリアする', async () => {
    mockCheckAndUnlock.mockResolvedValue(['streak-3'] as BadgeId[])
    mockGetUnlocked.mockResolvedValue(['first-step', 'streak-3'] as BadgeId[])

    let captured: AchievementContextType | undefined

    await act(async () => {
      render(
        <AchievementProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </AchievementProvider>,
      )
    })

    await waitFor(() => {
      expect(captured!.newlyUnlockedBadge).toBe('streak-3')
    })

    await act(() => {
      captured!.dismissBadgeToast()
    })

    await waitFor(() => {
      expect(captured!.newlyUnlockedBadge).toBeNull()
    })
  })

  it('useAchievementContext が AchievementProvider の外で使用されると例外を投げる', () => {
    expect(() => {
      function Thrower() {
        useAchievementContext()
        return null
      }
      render(<Thrower />)
    }).toThrow('useAchievementContext must be used within an AchievementProvider')
  })
})
