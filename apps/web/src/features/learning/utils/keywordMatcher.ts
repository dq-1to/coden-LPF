/**
 * コード内に全ての expectedKeywords が含まれるか検証する（大文字小文字無視）
 */
export function checkAllKeywords(code: string, expectedKeywords: string[]): boolean {
  const lower = code.toLowerCase()
  return expectedKeywords.every((kw) => lower.includes(kw.toLowerCase()))
}

/**
 * コード内に含まれていない expectedKeywords を返す（大文字小文字無視）
 */
export function getMissingKeywords(code: string, expectedKeywords: string[]): string[] {
  const lower = code.toLowerCase()
  return expectedKeywords.filter((kw) => !lower.includes(kw.toLowerCase()))
}
