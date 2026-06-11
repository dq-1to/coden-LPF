import { advancedSteps } from '../advanced/steps'
import { apiPracticeSteps } from '../api-practice/steps'
import { findCourseByStepId, findStepById } from '../courseData'
import { fundamentalsSteps, type LearningStepContent } from '../fundamentals/steps'
import { intermediateSteps } from '../intermediate/steps'
import { reactModernSteps } from '../react-modern/steps'
import { reactPatternsSteps } from '../react-patterns/steps'
import { typescriptSteps } from '../typescript/steps'
import { typescriptReactSteps } from '../typescript-react/steps'
import { BASE_NOOK_TOPICS } from './topics'

export interface RelatedBaseNookTopic {
  id: string
  title: string
  summary: string
}

export interface RelatedStepLink {
  id: string
  order: number
  title: string
  description: string
  courseTitle: string
}

const allLearningSteps: readonly LearningStepContent[] = [
  ...fundamentalsSteps,
  ...intermediateSteps,
  ...advancedSteps,
  ...apiPracticeSteps,
  ...typescriptSteps,
  ...typescriptReactSteps,
  ...reactModernSteps,
  ...reactPatternsSteps,
]

export function getRelatedBaseNookTopics(step: Pick<LearningStepContent, 'relatedBaseNook'>): RelatedBaseNookTopic[] {
  if (!step.relatedBaseNook?.length) return []

  return step.relatedBaseNook
    .map((topicId) => BASE_NOOK_TOPICS.find((topic) => topic.id === topicId))
    .filter((topic): topic is NonNullable<typeof topic> => topic != null)
    .map((topic) => ({
      id: topic.id,
      title: topic.title,
      summary: topic.summary,
    }))
}

export function getStepsRelatedToBaseNook(topicId: string): RelatedStepLink[] {
  return allLearningSteps
    .filter((step) => step.relatedBaseNook?.includes(topicId))
    .map((step) => {
      const stepMeta = findStepById(step.id)
      const course = findCourseByStepId(step.id)

      return {
        id: step.id,
        order: step.order,
        title: stepMeta?.title ?? step.title,
        description: stepMeta?.description ?? step.summary,
        courseTitle: course?.title ?? 'カリキュラム',
      }
    })
    .sort((a, b) => a.order - b.order)
}
