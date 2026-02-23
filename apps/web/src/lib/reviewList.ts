/**
 * 復習リスト管理 — localStorage ベースの最小実装
 *
 * Practice / Test で不正解だったステップの stepId を保存する。
 * Dashboard で「復習が必要なステップ」として表示する。
 */

const REVIEW_LIST_KEY = 'coden_review_list'

export function getReviewList(): string[] {
  try {
    const json = localStorage.getItem(REVIEW_LIST_KEY)
    return json ? (JSON.parse(json) as string[]) : []
  } catch {
    return []
  }
}

export function addToReviewList(stepId: string): void {
  const list = getReviewList()
  if (!list.includes(stepId)) {
    localStorage.setItem(REVIEW_LIST_KEY, JSON.stringify([...list, stepId]))
  }
}

export function removeFromReviewList(stepId: string): void {
  const list = getReviewList()
  localStorage.setItem(REVIEW_LIST_KEY, JSON.stringify(list.filter((id) => id !== stepId)))
}

export function clearReviewList(): void {
  localStorage.removeItem(REVIEW_LIST_KEY)
}
