import { Trophy } from 'lucide-react'
import { BADGE_DEFINITIONS } from '../services/achievementService'
import { useAchievementContext } from '../contexts/AchievementContext'

export function AchievementToast() {
  const { newlyUnlockedBadge } = useAchievementContext()
  const badgeDef = newlyUnlockedBadge ? BADGE_DEFINITIONS.find((badge) => badge.id === newlyUnlockedBadge) : null

  if (!badgeDef) return null

  return (
    <div
      className="fixed bottom-5 right-5 z-50 animate-bounce rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 shadow-xl"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 shadow-inner">
          <Trophy className="h-5 w-5 text-amber-700" />
        </div>
        <div>
          <p className="text-xs font-bold text-amber-600">新しいバッジを獲得しました！</p>
          <p className="font-semibold text-amber-900">{badgeDef.name}</p>
          <p className="text-xs text-amber-700">{badgeDef.description}</p>
        </div>
      </div>
    </div>
  )
}
