import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

interface FeedbackContextValue {
  isOpen: boolean
  openFeedback: () => void
  closeFeedback: () => void
}

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined)

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openFeedback = useCallback(() => setIsOpen(true), [])
  const closeFeedback = useCallback(() => setIsOpen(false), [])

  const value = useMemo<FeedbackContextValue>(
    () => ({ isOpen, openFeedback, closeFeedback }),
    [isOpen, openFeedback, closeFeedback],
  )

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFeedbackContext() {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error('useFeedbackContext must be used inside FeedbackProvider')
  }
  return context
}
