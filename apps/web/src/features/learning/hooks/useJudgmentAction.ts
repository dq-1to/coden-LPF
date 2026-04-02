import { useCallback, useState } from 'react'
import { addToReviewList, removeFromReviewList } from '@/services/reviewListService'
import { useStepReset } from './useStepReset'

/** 判定結果に応じてレビューリスト操作と onComplete 呼び出しを行うフック */
export function useJudgmentAction(stepId: string, onComplete: () => void) {
  const [reported, setReported] = useState(false)

  useStepReset(stepId, () => setReported(false))

  const handleResult = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) {
        removeFromReviewList(stepId)
        if (!reported) {
          onComplete()
          setReported(true)
        }
      } else {
        addToReviewList(stepId)
      }
    },
    [stepId, reported, onComplete],
  )

  return { reported, handleResult }
}
