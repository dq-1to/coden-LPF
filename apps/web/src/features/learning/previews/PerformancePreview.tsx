import { useMemo, useState } from 'react'

function heavyCompute(n: number): number {
  let result = 0
  for (let i = 0; i < n * 100; i++) result += i
  return result
}

export default function PerformancePreview() {
  const [count, setCount] = useState(10)
  const [color, setColor] = useState('emerald')

  const computed = useMemo(() => heavyCompute(count), [count])

  return (
    <div className="space-y-3">
      <div className={`rounded-md border px-3 py-2 text-sm ${color === 'emerald' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>
        計算結果: <span className="font-bold">{computed.toLocaleString()}</span>
      </div>
      <div className="flex gap-2">
        <button
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 active:scale-95"
          onClick={() => setCount((c) => c + 10)}
        >
          計算量を増やす ({count})
        </button>
        <button
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 active:scale-95"
          onClick={() => setColor((c) => (c === 'emerald' ? 'blue' : 'emerald'))}
        >
          色を切替
        </button>
      </div>
      <p className="text-xs text-slate-500">色を切替えても useMemo で再計算をスキップ</p>
    </div>
  )
}
