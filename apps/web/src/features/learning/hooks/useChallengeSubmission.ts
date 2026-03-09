import { useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createChallengeSubmission } from '@/services/challengeSubmissionService'

export interface ChallengeSubmissionAttempt {
  code: string
  isPassed: boolean
  matchedKeywords: string[]
}

export function useChallengeSubmission(stepId: string) {
  const { user } = useAuth()

  return useCallback(
    async ({ code, isPassed, matchedKeywords }: ChallengeSubmissionAttempt) => {
      if (!user?.id) {
        return
      }

      await createChallengeSubmission({
        user_id: user.id,
        step_id: stepId,
        code,
        is_passed: isPassed,
        matched_keywords: matchedKeywords,
      })
    },
    [stepId, user?.id],
  )
}
