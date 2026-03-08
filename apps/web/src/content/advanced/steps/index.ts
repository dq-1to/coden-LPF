import type { LearningStepContent } from '@/content/fundamentals/steps'
import { customHooksStep } from './custom-hooks'
import { apiFetchStep } from './api-fetch'
import { performanceStep } from './performance'
import { testingStep } from './testing'

export const advancedSteps: LearningStepContent[] = [
  customHooksStep,
  apiFetchStep,
  performanceStep,
  testingStep,
]

export function getAdvancedStep(stepId: string) {
  return advancedSteps.find((step) => step.id === stepId)
}
