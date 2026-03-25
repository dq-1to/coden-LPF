import { useState } from 'react'

export default function ApiCounterPostPreview() {
  const [count, setCount] = useState(0)
  const [sending, setSending] = useState(false)

  function handleIncrement() {
    setSending(true)
    setTimeout(() => {
      setCount((c) => c + 1)
      setSending(false)
    }, 400)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-500">POST /api/counter</p>
      <p className="text-2xl font-bold text-slate-800">{count}</p>
      <button
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
        onClick={handleIncrement}
        disabled={sending}
      >
        {sending ? '送信中…' : '+1 (POST)'}
      </button>
    </div>
  )
}
