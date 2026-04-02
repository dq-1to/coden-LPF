import type { LearningStepContent } from '@/content/fundamentals/steps'
import { errorBoundaryStep } from './error-boundary'
import { suspenseLazyStep } from './suspense-lazy'
import { concurrentFeaturesStep } from './concurrent-features'
import { useOptimisticStep } from './use-optimistic'
import { portalsStep } from './portals'
import { forwardRefStep } from './forward-ref'

export const reactModernSteps: LearningStepContent[] = [
  errorBoundaryStep,
  suspenseLazyStep,
  concurrentFeaturesStep,
  useOptimisticStep,
  portalsStep,
  forwardRefStep,
]

export function getReactModernStep(stepId: string): LearningStepContent | undefined {
  return reactModernSteps.find((step) => step.id === stepId)
}
