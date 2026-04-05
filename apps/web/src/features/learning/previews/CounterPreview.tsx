import { useState } from 'react'

export default function CounterPreview() {
  const [count, setCount] = useState(0)

  return (
    <div className="space-y-3">
      <p className="text-2xl font-bold text-slate-800">{count}</p>
      <div className="flex gap-2">
        <button
          className="rounded-lg bg-emerald-600 px-4 py-2 min-h-[44px] text-sm font-medium text-white hover:bg-emerald-700 active:scale-95"
          onClick={() => setCount((c) => c + 1)}
        >
          +1
        </button>
        <button
          className="rounded-lg bg-slate-600 px-4 py-2 min-h-[44px] text-sm font-medium text-white hover:bg-slate-700 active:scale-95"
          onClick={() => setCount((c) => c - 1)}
        >
          -1
        </button>
        <button
          className="rounded-lg border border-slate-300 px-4 py-2 min-h-[44px] text-sm font-medium text-slate-700 hover:bg-slate-100 active:scale-95"
          onClick={() => setCount(0)}
        >
          リセット
        </button>
      </div>
    </div>
  )
}
