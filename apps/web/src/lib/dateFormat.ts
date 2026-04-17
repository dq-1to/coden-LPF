/**
 * JST タイムゾーンでの日付・日時フォーマットユーティリティ
 *
 * 管理画面・ダッシュボードなど複数ページで共通利用する。
 */

/** ISO 文字列を JST の「YYYY/MM/DD HH:mm」形式にフォーマット */
export function formatJstDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

/**
 * ISO 文字列または DATE 文字列を JST の日付のみにフォーマット。
 * YYYY-MM-DD 形式（DATE 型）はそのまま返す。
 */
export function formatJstDate(value: string | null): string {
  if (!value) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  return new Date(value).toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
