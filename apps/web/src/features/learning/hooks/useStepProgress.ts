import { useCallback, useEffect, useRef, useState } from 'react'
import type { LearningMode, LearningStepContent } from '@/content/fundamentals/steps'
import { useAuth } from '@/contexts/AuthContext'
import { useLearningContext } from '@/contexts/LearningContext'
import { useAchievementContext } from '@/contexts/AchievementContext'
import { awardPoints } from '@/services/pointService'
import { POINTS_PER_MODE_COMPLETE } from '@/shared/constants'
import { getStepProgress, updateModeCompletion, upsertProgress } from '@/services/progressService'
import { recordStudyActivity } from '@/services/statsService'

type ModeStatus = Record<LearningMode, boolean>

const INITIAL_MODE_STATUS: ModeStatus = {
  read: false,
  practice: false,
  test: false,
  challenge: false,
}

function toModeStatus(progress: Awaited<ReturnType<typeof getStepProgress>>): ModeStatus {
  return {
    read: progress?.read_done ?? false,
    practice: progress?.practice_done ?? false,
    test: progress?.test_done ?? false,
    challenge: progress?.challenge_done ?? false,
  }
}

export interface UseStepProgressReturn {
  modeStatus: ModeStatus
  isStepCompleted: boolean
  syncMessage: string | null
  handleModeComplete: (mode: LearningMode) => Promise<void>
}

/** 進捗状態の管理・永続化を担うフック */
export function useStepProgress(stepId: string, step: LearningStepContent | undefined): UseStepProgressReturn {
  const { user } = useAuth()
  const { refreshStats } = useLearningContext()
  const { refreshAchievements } = useAchievementContext()

  const [modeStatus, setModeStatus] = useState<ModeStatus>(INITIAL_MODE_STATUS)
  const modeStatusRef = useRef(modeStatus)
  useEffect(() => { modeStatusRef.current = modeStatus }, [modeStatus])
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const isStepCompleted = modeStatus.read && modeStatus.practice && modeStatus.test && modeStatus.challenge

  useEffect(() => {
    setSyncMessage(null)
  }, [stepId])

  useEffect(() => {
    const userId = user?.id ?? ''
    if (!step || userId.length === 0) {
      setModeStatus(INITIAL_MODE_STATUS)
      return
    }

    const currentStepId = step.id
    let isMounted = true

    async function loadStepProgress() {
      try {
        const progress = await getStepProgress(userId, currentStepId)
        if (!isMounted) return
        setModeStatus(toModeStatus(progress))
      } catch (error) {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : '進捗の取得に失敗しました。'
        setSyncMessage(message)
      }
    }

    void loadStepProgress()

    return () => {
      isMounted = false
    }
  }, [step, user?.id])

  const handleModeComplete = useCallback(
    async (mode: LearningMode) => {
      const currentStatus = modeStatusRef.current
      if (!step || !user?.id || currentStatus[mode]) return

      const wasStepCompleted = currentStatus.read && currentStatus.practice && currentStatus.test && currentStatus.challenge

      setModeStatus((prev) => ({ ...prev, [mode]: true }))
      setSyncMessage(null)

      try {
        if (mode === 'read') {
          await upsertProgress(user.id, step.id, { read_done: true })
        } else {
          await updateModeCompletion(user.id, step.id, mode)
        }

        const latestProgress = await getStepProgress(user.id, step.id)
        setModeStatus(toModeStatus(latestProgress))

        const isNowStepCompleted =
          latestProgress?.read_done &&
          latestProgress?.practice_done &&
          latestProgress?.test_done &&
          latestProgress?.challenge_done
        if (isNowStepCompleted && !wasStepCompleted) {
          await recordStudyActivity()
        }

        const reason = `「${step.title}」の${mode}モード完了`
        await awardPoints(POINTS_PER_MODE_COMPLETE, reason)
        await refreshStats()
        try {
          await refreshAchievements()
        } catch (err) {
          console.error('Achievement refresh failed:', err)
        }
      } catch (error) {
        setModeStatus((prev) => ({ ...prev, [mode]: false }))
        const message = error instanceof Error ? error.message : '進捗保存に失敗しました。'
        setSyncMessage(message)
      }
    },
    [refreshStats, refreshAchievements, step, user?.id],
  )

  return { modeStatus, isStepCompleted, syncMessage, handleModeComplete }
}
