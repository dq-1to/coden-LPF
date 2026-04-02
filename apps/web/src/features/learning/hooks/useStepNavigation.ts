import { useMemo } from 'react'
import { findStepById, findCourseByStepId } from '@/content/courseData'
import { fundamentalsSteps, getFundamentalsStep, type LearningStepContent } from '@/content/fundamentals/steps'
import { getIntermediateStep, intermediateSteps } from '@/content/intermediate/steps'
import { advancedSteps, getAdvancedStep } from '@/content/advanced/steps'
import { apiPracticeSteps, getApiPracticeStep } from '@/content/api-practice/steps'
import { typescriptSteps, getTypescriptStep } from '@/content/typescript/steps'
import { typescriptReactSteps, getTypescriptReactStep } from '@/content/typescript-react/steps'
import { reactModernSteps, getReactModernStep } from '@/content/react-modern/steps'
import { reactPatternsSteps, getReactPatternsStep } from '@/content/react-patterns/steps'

export interface UseStepNavigationReturn {
  step: LearningStepContent | undefined
  isUnavailableStep: boolean
  nextStep: LearningStepContent | undefined
  sidebarTitle: string
  sidebarSteps: LearningStepContent[]
}

/** ステップ検索・ナビゲーション情報を提供するフック */
export function useStepNavigation(stepId: string): UseStepNavigationReturn {
  const stepMeta = findStepById(stepId)
  const step = getFundamentalsStep(stepId) || getIntermediateStep(stepId) || getAdvancedStep(stepId) || getApiPracticeStep(stepId) || getTypescriptStep(stepId) || getTypescriptReactStep(stepId) || getReactModernStep(stepId) || getReactPatternsStep(stepId)
  const isUnavailableStep = Boolean(stepMeta && !stepMeta.isImplemented)

  const orderedSteps = useMemo(
    () => [...fundamentalsSteps, ...intermediateSteps, ...advancedSteps, ...apiPracticeSteps, ...typescriptSteps, ...typescriptReactSteps, ...reactModernSteps, ...reactPatternsSteps].sort((a, b) => a.order - b.order),
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

  return { step, isUnavailableStep, nextStep, sidebarTitle, sidebarSteps }
}
