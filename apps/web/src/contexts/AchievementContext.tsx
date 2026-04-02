import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { checkAndUnlockAchievements, getUnlockedAchievements, type BadgeId } from '../services/achievementService'
import { useAuth } from './AuthContext'
import { BADGE_TOAST_DURATION_MS } from '../shared/constants'

interface AchievementContextType {
  unlockedBadgeIds: BadgeId[]
  refreshAchievements: () => Promise<void>
  isLoadingAchievements: boolean
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
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true)
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
      setIsLoadingAchievements(false)
      return
    }

    setIsLoadingAchievements(true)
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
        setIsLoadingAchievements(false)
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
    }, BADGE_TOAST_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [newlyUnlockedBadge])

  const dismissBadgeToast = useCallback(() => {
    setNewlyUnlockedBadge(null)
  }, [])

  return (
    <AchievementContext.Provider value={{ unlockedBadgeIds, refreshAchievements, isLoadingAchievements, newlyUnlockedBadge, dismissBadgeToast }}>
      {children}
    </AchievementContext.Provider>
  )
}
