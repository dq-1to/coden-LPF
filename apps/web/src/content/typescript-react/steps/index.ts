import type { LearningStepContent } from '@/content/fundamentals/steps'
import { tsReactPropsStep } from './ts-react-props'
import { tsReactStateStep } from './ts-react-state'
import { tsReactHooksStep } from './ts-react-hooks'
import { tsReactEventsStep } from './ts-react-events'

export const typescriptReactSteps: LearningStepContent[] = [
  tsReactPropsStep,
  tsReactStateStep,
  tsReactHooksStep,
  tsReactEventsStep,
]

export function getTypescriptReactStep(stepId: string): LearningStepContent | undefined {
  return typescriptReactSteps.find((step) => step.id === stepId)
}
