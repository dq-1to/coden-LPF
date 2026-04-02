import { useEffect, useRef, useState } from 'react'
import type { LearningStepContent } from '@/content/fundamentals/steps'
import { STEP_TOAST_DURATION_MS } from '@/shared/constants'

export interface UseStepNotificationReturn {
  toastMessage: string | null
}

/** ステップ完了トースト通知を管理するフック */
export function useStepNotification(
  stepId: string,
  step: LearningStepContent | undefined,
  isStepCompleted: boolean,
  nextStep: LearningStepContent | undefined,
): UseStepNotificationReturn {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const completedOnceRef = useRef(false)

  useEffect(() => {
    setToastMessage(null)
    completedOnceRef.current = false
  }, [stepId])

  useEffect(() => {
    if (!step || !isStepCompleted || completedOnceRef.current) return

    completedOnceRef.current = true

    if (nextStep) {
      setToastMessage(`「${step.title}」を完了しました。次のステップへ進めます。`)
      return
    }

    setToastMessage('全ステップを完了しました。おめでとうございます！')
  }, [isStepCompleted, nextStep, step])

  useEffect(() => {
    if (!toastMessage) return

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null)
    }, STEP_TOAST_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [toastMessage])

  return { toastMessage }
}
