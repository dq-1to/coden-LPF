import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { BADGE_DEFINITIONS, checkAndUnlockAchievements, getUnlockedAchievements, type BadgeId } from '../services/achievementService'
import { useAuth } from './AuthContext'

interface AchievementContextType {
  unlockedBadgeIds: BadgeId[]
  refreshAchievements: () => Promise<void>
  isChecking: boolean
}

const AchievementContext = createContext<AchievementContextType | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useAchievementContext() {
  const context = useContext(AchievementContext)
  if (!context) {
    throw new Error('useAchievementContext must be used within an AchievementProvider')
  }
  return context
}

export function AchievementProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<BadgeId[]>([])
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<BadgeId | null>(null)
  const [toastQueue, setToastQueue] = useState<BadgeId[]>([])
  const [isChecking, setIsChecking] = useState(false)

  const refreshAchievements = useCallback(async () => {
    if (!userId) {
      setUnlockedBadgeIds([])
      setToastQueue([])
      setNewlyUnlockedBadge(null)
      setIsChecking(false)
      return
    }

    setIsChecking(true)
    try {
      const newlyUnlocked = await checkAndUnlockAchievements(userId)
      const latestUnlocked = await getUnlockedAchievements(userId)
      setUnlockedBadgeIds(latestUnlocked)

      if (newlyUnlocked.length > 0) {
        setToastQueue((prev) => [...prev, ...newlyUnlocked])
      }
    } finally {
      setIsChecking(false)
    }
  }, [userId])

  useEffect(() => {
    void refreshAchievements().catch((error) => {
      console.error('Failed to refresh achievements:', error)
    })
  }, [refreshAchievements])

  useEffect(() => {
    if (newlyUnlockedBadge || toastQueue.length === 0) {
      return
    }

    const [nextBadge, ...rest] = toastQueue
    setNewlyUnlockedBadge(nextBadge)
    setToastQueue(rest)
  }, [newlyUnlockedBadge, toastQueue])

  useEffect(() => {
    if (!newlyUnlockedBadge) {
      return
    }

    const timer = window.setTimeout(() => {
      setNewlyUnlockedBadge(null)
    }, 4000)

    return () => window.clearTimeout(timer)
  }, [newlyUnlockedBadge])

  const badgeDef = newlyUnlockedBadge ? BADGE_DEFINITIONS.find((badge) => badge.id === newlyUnlockedBadge) : null

  return (
    <AchievementContext.Provider value={{ unlockedBadgeIds, refreshAchievements, isChecking }}>
      {children}

      {badgeDef ? (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 text-xl shadow-inner">
              🏆
            </div>
            <div>
              <p className="text-xs font-bold text-amber-600">新しいバッジを獲得しました！</p>
              <p className="font-semibold text-amber-900">{badgeDef.name}</p>
              <p className="text-xs text-amber-700">{badgeDef.description}</p>
            </div>
          </div>
        </div>
      ) : null}
    </AchievementContext.Provider>
  )
}
