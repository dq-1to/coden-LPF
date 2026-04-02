import type { LearningStepContent } from '@/content/fundamentals/steps'
import { tsTypesStep } from './ts-types'
import { tsFunctionsStep } from './ts-functions'
import { tsObjectsStep } from './ts-objects'
import { tsUnionNarrowingStep } from './ts-union-narrowing'
import { tsGenericsStep } from './ts-generics'
import { tsUtilityTypesStep } from './ts-utility-types'

export const typescriptSteps: LearningStepContent[] = [
  tsTypesStep,
  tsFunctionsStep,
  tsObjectsStep,
  tsUnionNarrowingStep,
  tsGenericsStep,
  tsUtilityTypesStep,
]

export function getTypescriptStep(stepId: string): LearningStepContent | undefined {
  return typescriptSteps.find((step) => step.id === stepId)
}
