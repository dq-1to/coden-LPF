import { useEffect, useState } from 'react'

export default function EffectPreview() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  return (
    <div className="space-y-3">
      <p className="text-2xl font-mono font-bold text-slate-800">{seconds}s</p>
      <div className="flex gap-2">
        <button
          className={`rounded-lg px-4 py-2 min-h-[44px] text-sm font-medium text-white active:scale-95 ${running ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? '停止' : '開始'}
        </button>
        <button
          className="rounded-lg border border-slate-300 px-4 py-2 min-h-[44px] text-sm font-medium text-slate-700 hover:bg-slate-100 active:scale-95"
          onClick={() => {
            setRunning(false)
            setSeconds(0)
          }}
        >
          リセット
        </button>
      </div>
      <p className="text-xs text-slate-500">useEffect でタイマーの副作用を管理しています</p>
    </div>
  )
}
