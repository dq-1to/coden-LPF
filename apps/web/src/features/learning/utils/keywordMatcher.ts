import { judgeKeywords } from '../../../lib/judge'

/**
 * コード内に全ての expectedKeywords が含まれるか検証する（大文字小文字無視）
 *
 * 共通ユーティリティ {@link judgeKeywords} に委譲する。
 */
export function checkAllKeywords(code: string, expectedKeywords: string[]): boolean {
  return judgeKeywords(code, { requiredKeywords: expectedKeywords }).passed
}

/**
 * コード内に含まれていない expectedKeywords を返す（大文字小文字無視）
 *
 * 共通ユーティリティ {@link judgeKeywords} に委譲する。
 */
export function getMissingKeywords(code: string, expectedKeywords: string[]): string[] {
  return judgeKeywords(code, { requiredKeywords: expectedKeywords }).missing
}
