import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { listOpen, resolveReviewItem, type ReviewItem } from '@/services/reviewService'

export function useReviewList() {
  const { user } = useAuth()
  const userId = user?.id
  const [items, setItems] = useState<ReviewItem[]>([])
  const [stepIds, setStepIds] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false

    async function sync() {
      if (!userId) {
        setItems([])
        setStepIds([])
        return
      }

      let openItems: ReviewItem[]
      try {
        openItems = await listOpen(userId, 50)
      } catch {
        openItems = []
      }

      if (cancelled) return

      setItems(openItems)
      setStepIds([...new Set(openItems.map((item) => item.step_id))])
    }

    void sync()

    return () => {
      cancelled = true
    }
  }, [userId])

  function handleRemove(stepId: string) {
    if (!userId) return

    const targets = items.filter((item) => item.step_id === stepId)
    setItems((prev) => prev.filter((item) => item.step_id !== stepId))
    setStepIds((prev) => prev.filter((id) => id !== stepId))

    void Promise.all(
      targets.map((item) =>
        resolveReviewItem({
          userId,
          stepId: item.step_id,
          mode: item.mode,
          questionId: item.question_id,
        }),
      ),
    )
  }

  return {
    stepIds,
    removeStep: handleRemove,
  }
}
