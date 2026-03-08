import type { LearningStepContent } from '@/content/fundamentals/steps'
import { apiCounterGetStep } from './api-counter-get'
import { apiCounterPostStep } from './api-counter-post'
import { apiTasksListStep } from './api-tasks-list'
import { apiTasksCreateStep } from './api-tasks-create'
import { apiTasksUpdateStep } from './api-tasks-update'
import { apiTasksDeleteStep } from './api-tasks-delete'
import { apiCustomHookStep } from './api-custom-hook'
import { apiErrorLoadingStep } from './api-error-loading'

export const apiPracticeSteps: LearningStepContent[] = [
  apiCounterGetStep,
  apiCounterPostStep,
  apiTasksListStep,
  apiTasksCreateStep,
  apiTasksUpdateStep,
  apiTasksDeleteStep,
  apiCustomHookStep,
  apiErrorLoadingStep,
]

export function getApiPracticeStep(stepId: string) {
  return apiPracticeSteps.find((step) => step.id === stepId)
}
