import { useEffect, useState } from 'react'

export default function ApiCounterGetPreview() {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = setTimeout(() => {
      setCount(42)
      setLoading(false)
    }, 600)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-500">GET /api/counter</p>
      {loading ? (
        <p className="text-sm text-slate-400 animate-pulse">取得中…</p>
      ) : (
        <p className="text-2xl font-bold text-slate-800">{count}</p>
      )}
      <button
        className="rounded-lg bg-blue-600 px-3 py-2 min-h-[44px] text-sm font-medium text-white hover:bg-blue-700 active:scale-95"
        onClick={() => {
          setLoading(true)
          setTimeout(() => {
            setCount(42)
            setLoading(false)
          }, 600)
        }}
      >
        再取得
      </button>
    </div>
  )
}
