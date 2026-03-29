import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { findStepById, findCourseByStepId } from '@/content/courseData'
import { fundamentalsSteps, getFundamentalsStep, type LearningMode, type LearningStepContent } from '@/content/fundamentals/steps'
import { getIntermediateStep, intermediateSteps } from '@/content/intermediate/steps'
import { advancedSteps, getAdvancedStep } from '@/content/advanced/steps'
import { apiPracticeSteps, getApiPracticeStep } from '@/content/api-practice/steps'
import { typescriptSteps, getTypescriptStep } from '@/content/typescript/steps'
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

export interface UseLearningStepReturn {
  step: LearningStepContent | undefined
  isUnavailableStep: boolean
  modeStatus: ModeStatus
  syncMessage: string | null
  toastMessage: string | null
  nextStep: LearningStepContent | undefined
  sidebarTitle: string
  sidebarSteps: LearningStepContent[]
  isStepCompleted: boolean
  handleModeComplete: (mode: LearningMode) => Promise<void>
}

export function useLearningStep(stepId: string): UseLearningStepReturn {
  const { user } = useAuth()
  const { refreshStats } = useLearningContext()
  const { refreshAchievements } = useAchievementContext()

  const [modeStatus, setModeStatus] = useState<ModeStatus>(INITIAL_MODE_STATUS)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const completedOnceRef = useRef(false)

  const stepMeta = findStepById(stepId)
  const step = getFundamentalsStep(stepId) || getIntermediateStep(stepId) || getAdvancedStep(stepId) || getApiPracticeStep(stepId) || getTypescriptStep(stepId)
  const isUnavailableStep = Boolean(stepMeta && !stepMeta.isImplemented)

  const orderedSteps = useMemo(
    () => [...fundamentalsSteps, ...intermediateSteps, ...advancedSteps, ...apiPracticeSteps, ...typescriptSteps].sort((a, b) => a.order - b.order),
    [],
  )

  const currentCourse = useMemo(
    () => findCourseByStepId(step?.id || stepId),
    [step?.id, stepId],
  )

  const sidebarTitle = currentCourse?.title || 'コース'

  const sidebarSteps = useMemo(() => {
    if (!currentCourse) return []
    const stepIds = new Set(currentCourse.steps.map((s) => s.id))
    return orderedSteps.filter((s) => stepIds.has(s.id))
  }, [currentCourse, orderedSteps])

  const nextStep = useMemo(() => {
    if (!step) return undefined
    const currentIndex = orderedSteps.findIndex((item) => item.id === step.id)
    if (currentIndex < 0) return undefined
    return orderedSteps[currentIndex + 1]
  }, [orderedSteps, step])

  const isStepCompleted = modeStatus.read && modeStatus.practice && modeStatus.test && modeStatus.challenge

  // stepId 変更時に状態をリセット
  useEffect(() => {
    setSyncMessage(null)
    setToastMessage(null)
    completedOnceRef.current = false
  }, [stepId])

  // 進捗のロード
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

  // ステップ完了トースト
  useEffect(() => {
    if (!step || !isStepCompleted || completedOnceRef.current) return

    completedOnceRef.current = true

    if (nextStep) {
      setToastMessage(`「${step.title}」を完了しました。次のステップへ進めます。`)
      return
    }

    setToastMessage('全ステップを完了しました。おめでとうございます！')
  }, [isStepCompleted, nextStep, step])

  // トーストの自動クリア
  useEffect(() => {
    if (!toastMessage) return

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null)
    }, 3500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [toastMessage])

  const handleModeComplete = useCallback(
    async (mode: LearningMode) => {
      if (!step || !user?.id || modeStatus[mode]) return

      const wasStepCompleted = modeStatus.read && modeStatus.practice && modeStatus.test && modeStatus.challenge

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
          await recordStudyActivity(user.id)
        }

        const reason = `「${step.title}」の${mode}モード完了`
        await awardPoints(user.id, POINTS_PER_MODE_COMPLETE, reason)
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
    [modeStatus, refreshStats, refreshAchievements, step, user?.id],
  )

  return {
    step,
    isUnavailableStep,
    modeStatus,
    syncMessage,
    toastMessage,
    nextStep,
    sidebarTitle,
    sidebarSteps,
    isStepCompleted,
    handleModeComplete,
  }
}
