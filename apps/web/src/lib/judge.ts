/**
 * コード判定の共通ユーティリティ。
 *
 * Challenge / Code Doctor / Mini Project などの各判定モードが
 * 共通の `JudgeResult` を返せるよう、キーワード判定ロジックを集約する。
 *
 * v5roadmap04 M1: 合否（boolean）から「スコア + 詳細」を返す構造へ拡張。
 * `passed` の意味は従来通り（必須をすべて満たし、禁止に違反しない）を維持する。
 */

/** 判定結果モデル（合否 + 部分点 + 詳細） */
export interface JudgeResult {
  /** 合格したか（必須をすべて満たし、禁止に違反しない） */
  passed: boolean
  /** 部分点 0-100（満たした必須要件の割合） */
  score: number
  /** 満たした要件 */
  matched: string[]
  /** 不足している要件 */
  missing: string[]
  /** 禁止キーワード等の違反 */
  violations: string[]
}

/** キーワード判定の入力 */
export interface KeywordJudgeInput {
  /** すべて含まれている必要があるキーワード */
  requiredKeywords: string[]
  /** 含まれていてはいけないキーワード（任意） */
  ngKeywords?: string[]
}

/**
 * キーワードベースでコードを判定する（大文字小文字を区別しない）。
 *
 * - `matched`: requiredKeywords のうちコードに含まれるもの
 * - `missing`: requiredKeywords のうちコードに含まれないもの
 * - `violations`: ngKeywords のうちコードに含まれるもの
 * - `score`: matched / required の割合（0-100）。required が空なら 100
 * - `passed`: missing が空 かつ violations が空
 */
export function judgeKeywords(code: string, input: KeywordJudgeInput): JudgeResult {
  const lower = code.toLowerCase()
  const required = input.requiredKeywords
  const ngKeywords = input.ngKeywords ?? []

  const matched = required.filter((kw) => lower.includes(kw.toLowerCase()))
  const missing = required.filter((kw) => !lower.includes(kw.toLowerCase()))
  const violations = ngKeywords.filter((kw) => lower.includes(kw.toLowerCase()))

  const score = required.length === 0 ? 100 : Math.round((matched.length / required.length) * 100)
  const passed = missing.length === 0 && violations.length === 0

  return { passed, score, matched, missing, violations }
}
