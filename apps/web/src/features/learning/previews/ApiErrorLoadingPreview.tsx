import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ApiErrorLoadingPreview() {
  const [status, setStatus] = useState<Status>('idle')

  function simulateSuccess() {
    setStatus('loading')
    setTimeout(() => setStatus('success'), 1000)
  }

  function simulateError() {
    setStatus('loading')
    setTimeout(() => setStatus('error'), 1000)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-500">非同期UIの状態管理</p>

      <div className="min-h-[44px] rounded-md border border-slate-200 px-3 py-2">
        {status === 'idle' && <p className="text-sm text-slate-400">ボタンを押してリクエストを送信</p>}
        {status === 'loading' && <p className="text-sm text-blue-500 animate-pulse">読み込み中…</p>}
        {status === 'success' && <p className="text-sm font-medium text-emerald-700">データの取得に成功しました</p>}
        {status === 'error' && (
          <div>
            <p className="text-sm font-medium text-rose-700">エラーが発生しました</p>
            <p className="text-xs text-rose-500">ネットワークエラー: 接続がタイムアウトしました</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          className="rounded-lg bg-emerald-600 px-3 py-2 min-h-[44px] text-sm font-medium text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          onClick={simulateSuccess}
          disabled={status === 'loading'}
        >
          成功パターン
        </button>
        <button
          className="rounded-lg bg-rose-600 px-3 py-2 min-h-[44px] text-sm font-medium text-white hover:bg-rose-700 active:scale-95 disabled:opacity-50"
          onClick={simulateError}
          disabled={status === 'loading'}
        >
          エラーパターン
        </button>
        {(status === 'success' || status === 'error') && (
          <button
            className="rounded-lg border border-slate-300 px-3 py-2 min-h-[44px] text-sm text-slate-600 hover:bg-slate-100"
            onClick={() => setStatus('idle')}
          >
            リセット
          </button>
        )}
      </div>
    </div>
  )
}
