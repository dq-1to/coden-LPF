import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  clearChallengeDraft,
  readChallengeDraft,
  writeChallengeDraft,
} from '@/lib/challengeDraft'

const AUTOSAVE_DEBOUNCE_MS = 500

interface UseChallengeDraftParams {
  /** draft の保存・復元を有効にするか（モバイルパズル時は false にする） */
  enabled: boolean
}

interface UseChallengeDraftResult {
  /** 保存済み draft を取得する（なければ null）。初期コード決定や step 切替時の復元に使う。 */
  readDraft: (stepId: string, patternId: string) => string | null
  /** 入力コードをデバウンス保存する。 */
  scheduleSave: (stepId: string, patternId: string, code: string) => void
  /** draft を即時削除する（正解時に呼ぶ）。 */
  clearDraft: (stepId: string, patternId: string) => void
}

/**
 * Challenge の途中コードを `userId + stepId + patternId` 単位で localStorage 自動保存する。
 * - 復元: readDraft() の戻り値を初期コードに使う
 * - 保存: scheduleSave() を入力のたびに呼ぶ（デバウンス）
 * - 削除: 正解時に clearDraft() を呼ぶ
 *
 * userId が未取得、または enabled=false（モバイルパズル）の場合は何もしない。
 */
export function useChallengeDraft({ enabled }: UseChallengeDraftParams): UseChallengeDraftResult {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isActive = enabled && userId != null

  const readDraft = useCallback(
    (stepId: string, patternId: string): string | null => {
      if (!isActive || userId == null) return null
      return readChallengeDraft(userId, stepId, patternId)
    },
    [isActive, userId],
  )

  const scheduleSave = useCallback(
    (stepId: string, patternId: string, code: string) => {
      if (!isActive || userId == null) return
      if (timerRef.current != null) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        writeChallengeDraft(userId, stepId, patternId, code)
      }, AUTOSAVE_DEBOUNCE_MS)
    },
    [isActive, userId],
  )

  const clearDraft = useCallback(
    (stepId: string, patternId: string) => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (userId == null) return
      clearChallengeDraft(userId, stepId, patternId)
    },
    [userId],
  )

  // アンマウント時に保留中のデバウンスタイマーを破棄する
  useEffect(() => {
    return () => {
      if (timerRef.current != null) clearTimeout(timerRef.current)
    }
  }, [])

  return { readDraft, scheduleSave, clearDraft }
}
