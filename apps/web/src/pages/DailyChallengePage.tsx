import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function DailyChallengePage() {
  useDocumentTitle('デイリーチャレンジ')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-text-dark">デイリーチャレンジ</h1>
      <p className="mt-2 text-text-light">準備中です</p>
    </div>
  )
}
