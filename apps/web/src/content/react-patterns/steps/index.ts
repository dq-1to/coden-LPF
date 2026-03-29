import type { LearningStepContent } from '@/content/fundamentals/steps'
import { rhfZodStep } from './rhf-zod'
import { paginationStep } from './pagination'
import { infiniteScrollStep } from './infinite-scroll'
import { authFlowStep } from './auth-flow'

export const reactPatternsSteps: LearningStepContent[] = [
  rhfZodStep,
  paginationStep,
  infiniteScrollStep,
  authFlowStep,
]

export function getReactPatternsStep(stepId: string): LearningStepContent | undefined {
  return reactPatternsSteps.find((step) => step.id === stepId)
}
