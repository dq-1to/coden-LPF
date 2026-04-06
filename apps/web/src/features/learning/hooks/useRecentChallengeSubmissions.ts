import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getRecentChallengeSubmissions,
  type ChallengeSubmission,
} from '@/services/challengeSubmissionService'

export function useRecentChallengeSubmissions(stepId: string) {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setSubmissions([])
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await getRecentChallengeSubmissions(user.id, stepId)
      setSubmissions(data)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Challenge の提出履歴取得に失敗しました'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [stepId, user?.id])

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      if (!user?.id) {
        if (isMounted) {
          setSubmissions([])
          setError(null)
          setIsLoading(false)
        }
        return
      }
      if (isMounted) {
        setIsLoading(true)
        setError(null)
      }
      try {
        const data = await getRecentChallengeSubmissions(user.id, stepId)
        if (isMounted) setSubmissions(data)
      } catch (loadError) {
        if (isMounted) {
          const message = loadError instanceof Error ? loadError.message : 'Challenge の提出履歴取得に失敗しました'
          setError(message)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    load().catch(() => undefined)
    return () => { isMounted = false }
  }, [stepId, user?.id])

  return {
    submissions,
    isLoading,
    error,
    refresh,
  }
}
