import type { LearningMode, LearningStepContent } from '@/content/fundamentals/steps'
import { useStepNavigation } from './useStepNavigation'
import { useStepProgress } from './useStepProgress'
import { useStepNotification } from './useStepNotification'

type ModeStatus = Record<LearningMode, boolean>

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

/** 学習ステップ全体を束ねるファサードフック */
export function useLearningStep(stepId: string): UseLearningStepReturn {
  const navigation = useStepNavigation(stepId)
  const { modeStatus, isStepCompleted, syncMessage, handleModeComplete } = useStepProgress(stepId, navigation.step)
  const { toastMessage } = useStepNotification(stepId, navigation.step, isStepCompleted, navigation.nextStep)

  return {
    ...navigation,
    modeStatus,
    syncMessage,
    toastMessage,
    isStepCompleted,
    handleModeComplete,
  }
}
