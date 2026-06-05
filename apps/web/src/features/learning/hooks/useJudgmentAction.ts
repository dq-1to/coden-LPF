import { useCallback, useState } from 'react'
import { findCourseByStepId } from '@/content/courseData'
import { useAuth } from '@/contexts/AuthContext'
import { trackLearningEvent, type LearningEventType } from '@/services/eventService'
import { recordWrongAnswer, resolveReviewItem, type ReviewMode } from '@/services/reviewService'
import { useStepReset } from './useStepReset'

export type ReviewPayload = {
  questionId?: string | null
  expected?: string | null
  userInput?: string | null
}

const SUBMITTED_EVENT_BY_MODE = {
  practice: 'practice_answer_submitted',
  test: 'test_submitted',
  challenge: 'challenge_submitted',
} as const satisfies Partial<Record<ReviewMode, LearningEventType>>

/** 判定結果に応じてレビューリスト操作と onComplete 呼び出しを行うフック */
export function useJudgmentAction(stepId: string, mode: ReviewMode, onComplete: () => void) {
  const { user } = useAuth()
  const userId = user?.id
  const [reported, setReported] = useState(false)

  useStepReset(stepId, () => setReported(false))

  const handleResult = useCallback(
    async (isCorrect: boolean, payloads: ReviewPayload | ReviewPayload[] = {}) => {
      const items = Array.isArray(payloads) ? payloads : [payloads]

      if (userId) {
        const submittedEventType = SUBMITTED_EVENT_BY_MODE[mode as keyof typeof SUBMITTED_EVENT_BY_MODE]
        if (submittedEventType) {
          trackLearningEvent({
            userId,
            eventType: submittedEventType,
            stepId,
            mode: mode as keyof typeof SUBMITTED_EVENT_BY_MODE,
            courseId: findCourseByStepId(stepId)?.id ?? null,
            payload: {
              isCorrect,
              itemCount: items.length,
              questionIds: items.map((item) => item.questionId ?? null),
            },
          })
        }

        try {
          if (isCorrect) {
            await Promise.all(
              items.map((item) => {
                const questionId = item.questionId ?? null
                return resolveReviewItem({
                  userId,
                  stepId,
                  mode,
                  questionId,
                })
              }),
            )
          } else {
            await Promise.all(
              items.map((item) => {
                const questionId = item.questionId ?? null
                const expected = item.expected ?? null
                const userInput = item.userInput ?? null
                return recordWrongAnswer({
                  userId,
                  stepId,
                  mode,
                  questionId,
                  expected,
                  userInput,
                })
              }),
            )
          }
        } catch {
          // 復習キュー同期の失敗で学習モード完了を止めない。
        }
      }

      if (isCorrect) {
        if (!reported) {
          onComplete()
          setReported(true)
        }
      }
    },
    [stepId, mode, reported, onComplete, userId],
  )

  return { reported, handleResult }
}
