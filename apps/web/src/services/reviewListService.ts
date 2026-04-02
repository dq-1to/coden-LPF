const REVIEW_LIST_STORAGE_KEY = 'coden_review_list'
const REVIEW_LIST_UPDATED_EVENT = 'coden:review-list-updated'

function isBrowserEnvironment() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function notifyReviewListUpdated() {
  if (!isBrowserEnvironment()) {
    return
  }

  window.dispatchEvent(new CustomEvent(REVIEW_LIST_UPDATED_EVENT))
}

export function getReviewList(): string[] {
  if (!isBrowserEnvironment()) {
    return []
  }

  try {
    const json = localStorage.getItem(REVIEW_LIST_STORAGE_KEY)
    const parsed: unknown = json ? JSON.parse(json) : []
    return Array.isArray(parsed) && parsed.every(item => typeof item === 'string') ? parsed : []
  } catch {
    return []
  }
}

export function addToReviewList(stepId: string): void {
  const list = getReviewList()
  if (list.includes(stepId)) {
    return
  }

  localStorage.setItem(REVIEW_LIST_STORAGE_KEY, JSON.stringify([...list, stepId]))
  notifyReviewListUpdated()
}

export function removeFromReviewList(stepId: string): void {
  const nextList = getReviewList().filter((id) => id !== stepId)
  localStorage.setItem(REVIEW_LIST_STORAGE_KEY, JSON.stringify(nextList))
  notifyReviewListUpdated()
}

export function clearReviewList(): void {
  if (!isBrowserEnvironment()) {
    return
  }

  localStorage.removeItem(REVIEW_LIST_STORAGE_KEY)
  notifyReviewListUpdated()
}

export function subscribeReviewList(onChange: () => void): () => void {
  if (!isBrowserEnvironment()) {
    return () => {}
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== REVIEW_LIST_STORAGE_KEY) {
      return
    }

    onChange()
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(REVIEW_LIST_UPDATED_EVENT, onChange)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(REVIEW_LIST_UPDATED_EVENT, onChange)
  }
}

