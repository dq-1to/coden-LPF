import { useEffect, useState } from 'react'
import {
  getReviewList,
  removeFromReviewList,
  subscribeReviewList,
} from '@/services/reviewListService'

export function useReviewList() {
  const [stepIds, setStepIds] = useState<string[]>([])

  useEffect(() => {
    const sync = () => {
      setStepIds(getReviewList())
    }

    sync()

    return subscribeReviewList(sync)
  }, [])

  function handleRemove(stepId: string) {
    removeFromReviewList(stepId)
  }

  return {
    stepIds,
    removeStep: handleRemove,
  }
}
