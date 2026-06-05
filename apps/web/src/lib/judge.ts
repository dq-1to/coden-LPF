/**
 * コード判定の共通ユーティリティ。
 *
 * Challenge / Code Doctor / Mini Project などの各判定モードが
 * 共通の `JudgeResult` を返せるよう、キーワード判定ロジックを集約する。
 *
 * v5roadmap04 M1: 合否（boolean）から「スコア + 詳細」を返す構造へ拡張。
 * `passed` の意味は従来通り（必須をすべて満たし、禁止に違反しない）を維持する。
 * v5roadmap04 M2: Level 1 強化（複数正解パターン `anyOf` + 部分点閾値 `passThreshold`）。
 * 既定（anyOf / passThreshold 未指定）では M1 と同一挙動を保つ。
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

/**
 * キーワード判定の入力。
 *
 * 各オプショナルは `| undefined` を明示し、`exactOptionalPropertyTypes` 下でも
 * 呼び出し側がオプショナル値（例: `pattern.ngKeywords`）をそのまま渡せるようにする。
 */
export interface KeywordJudgeInput {
  /** 常に含まれている必要があるキーワード */
  requiredKeywords?: string[] | undefined
  /** 含まれていてはいけないキーワード（任意） */
  ngKeywords?: string[] | undefined
  /**
   * 複数正解パターン（任意）。いずれかの配列を満たせば可とする。
   * 最も多く一致した候補が採用され、requiredKeywords と AND される。
   */
  anyOf?: string[][] | undefined
  /**
   * 部分点での合格閾値（0-100、任意）。score がこの値以上で passed。
   * 未指定なら 100（= 全要件一致）で、M1 と同一挙動。
   */
  passThreshold?: number | undefined
}

/**
 * キーワードベースでコードを判定する（大文字小文字を区別しない）。
 *
 * - `matched`: 有効な必須要件のうちコードに含まれるもの
 * - `missing`: 有効な必須要件のうちコードに含まれないもの
 * - `violations`: ngKeywords のうちコードに含まれるもの
 * - `score`: matched / 有効必須 の割合（0-100）。有効必須が空なら 100
 * - `passed`: score >= passThreshold（既定 100）かつ violations が空
 *
 * `anyOf` 指定時は各候補を requiredKeywords に合成して個別に評価し、
 * 合格 > 高スコア の順で最良の結果を返す（一致数だけで選ぶと、完全充足した
 * 短い候補を一致数の多い未充足候補に取りこぼすため）。
 */
export function judgeKeywords(code: string, input: KeywordJudgeInput): JudgeResult {
  const lower = code.toLowerCase()
  const includes = (kw: string) => lower.includes(kw.toLowerCase())

  const violations = (input.ngKeywords ?? []).filter(includes)
  const baseRequired = input.requiredKeywords ?? []
  const threshold = input.passThreshold ?? 100

  // 評価対象の必須セット一覧（anyOf 指定時は各候補を base と合成）
  const candidateSets =
    input.anyOf && input.anyOf.length > 0
      ? input.anyOf.map((alt) => [...new Set([...baseRequired, ...alt])])
      : [baseRequired]

  const evaluate = (required: string[]): JudgeResult => {
    const matched = required.filter(includes)
    const missing = required.filter((kw) => !includes(kw))
    const score = required.length === 0 ? 100 : Math.round((matched.length / required.length) * 100)
    const passed = score >= threshold && violations.length === 0
    return { passed, score, matched, missing, violations }
  }

  // 候補ごとに評価し、合格 > 高スコア の順で最良を選ぶ
  return candidateSets.map(evaluate).reduce((best, cur) => {
    if (cur.passed !== best.passed) return cur.passed ? cur : best
    return cur.score > best.score ? cur : best
  })
}
