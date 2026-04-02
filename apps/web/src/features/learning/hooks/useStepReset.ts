import { useEffect, useRef } from 'react'

/** stepId 変更時にリセットコールバックを実行するフック */
export function useStepReset(stepId: string, resetFn: () => void) {
  const resetRef = useRef(resetFn)
  resetRef.current = resetFn

  useEffect(() => {
    resetRef.current()
  }, [stepId])
}
