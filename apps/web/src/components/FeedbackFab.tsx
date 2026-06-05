import { MessageSquarePlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useFeedbackContext } from '../contexts/FeedbackContext'

export function FeedbackFab() {
  const { user } = useAuth()
  const { openFeedback } = useFeedbackContext()

  if (!user) return null

  return (
    <button
      type="button"
      onClick={openFeedback}
      aria-label="フィードバックを送る"
      title="フィードバックを送る"
      className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary-mint text-white shadow-lg transition hover:bg-primary-dark hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-mint focus:ring-offset-2 sm:h-14 sm:w-14"
    >
      <MessageSquarePlus className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
    </button>
  )
}
