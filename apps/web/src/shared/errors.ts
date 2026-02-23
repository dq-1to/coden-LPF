/**
 * アプリケーション共通エラー型
 *
 * Supabase PostgrestError などの外部エラーを AppError に変換することで、
 * サービス層のエラーを一貫した型として上位レイヤーに伝える。
 */

export type AppErrorCode =
  | 'DB_UNIQUE_VIOLATION' // Supabase: 23505 (一意制約違反)
  | 'DB_NOT_FOUND' // Supabase: PGRST116 (行が見つからない)
  | 'DB_ERROR' // その他の DB エラー
  | 'UNKNOWN' // 予期しないエラー

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly userMessage: string
  readonly cause: unknown

  constructor(code: AppErrorCode, userMessage: string, cause?: unknown) {
    super(userMessage)
    this.name = 'AppError'
    this.code = code
    this.userMessage = userMessage
    this.cause = cause
  }
}

function toAppErrorCode(pgCode: string): AppErrorCode {
  if (pgCode === '23505') return 'DB_UNIQUE_VIOLATION'
  if (pgCode === 'PGRST116') return 'DB_NOT_FOUND'
  return 'DB_ERROR'
}

/**
 * Supabase PostgrestError を AppError に変換するヘルパー
 *
 * @param error - Supabase が返すエラーオブジェクト（code / message を持つ）
 * @param userMessage - ユーザーに表示するメッセージ（省略時は error.message を使用）
 */
export function fromSupabaseError(
  error: { code: string; message: string },
  userMessage?: string,
): AppError {
  const code = toAppErrorCode(error.code)
  return new AppError(code, userMessage ?? error.message, error)
}
