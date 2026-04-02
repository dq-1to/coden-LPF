import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { checkAndUnlockAchievements, getUnlockedAchievements, type BadgeId } from '../services/achievementService'
import { useAuth } from './AuthContext'

interface AchievementContextType {
  unlockedBadgeIds: BadgeId[]
  refreshAchievements: () => Promise<void>
  isChecking: boolean
  newlyUnlockedBadge: BadgeId | null
  dismissBadgeToast: () => void
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
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

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
      if (!isMountedRef.current) return
      setUnlockedBadgeIds(latestUnlocked)

      if (newlyUnlocked.length > 0) {
        setToastQueue((prev) => [...prev, ...newlyUnlocked])
      }
    } finally {
      if (isMountedRef.current) {
        setIsChecking(false)
      }
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

  const dismissBadgeToast = useCallback(() => {
    setNewlyUnlockedBadge(null)
  }, [])

  return (
    <AchievementContext.Provider value={{ unlockedBadgeIds, refreshAchievements, isChecking, newlyUnlockedBadge, dismissBadgeToast }}>
      {children}
    </AchievementContext.Provider>
  )
}
