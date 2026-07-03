/**
 * Challenge の途中コードを localStorage に保存・復元するための薄いラッパー。
 *
 * - key 形式: `coden:challengeDraft:${userId}:${stepId}:${patternId}`
 * - userId / stepId / patternId の組ごとに独立し、衝突しない。
 * - localStorage が使えない環境（プライベートモード等）でも例外を投げない。
 * - 対象は PC の自由入力コード。モバイルパズルは対象外（呼び出し側で制御する）。
 */

const DRAFT_KEY_PREFIX = 'coden:challengeDraft'

export function buildChallengeDraftKey(userId: string, stepId: string, patternId: string): string {
  return `${DRAFT_KEY_PREFIX}:${userId}:${stepId}:${patternId}`
}

export function readChallengeDraft(userId: string, stepId: string, patternId: string): string | null {
  try {
    return window.localStorage.getItem(buildChallengeDraftKey(userId, stepId, patternId))
  } catch {
    return null
  }
}

export function writeChallengeDraft(
  userId: string,
  stepId: string,
  patternId: string,
  code: string,
): void {
  try {
    window.localStorage.setItem(buildChallengeDraftKey(userId, stepId, patternId), code)
  } catch {
    // localStorage が使えない環境でも入力自体は継続できるよう、保存失敗は握りつぶす
  }
}

export function clearChallengeDraft(userId: string, stepId: string, patternId: string): void {
  try {
    window.localStorage.removeItem(buildChallengeDraftKey(userId, stepId, patternId))
  } catch {
    // 削除失敗も無視する
  }
}
