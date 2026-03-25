import { useState } from 'react'

export default function EventPreview() {
  const [message, setMessage] = useState('ボタンをクリックしてみましょう')
  const [hovered, setHovered] = useState(false)

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-700">{message}</p>
      <div className="flex gap-2">
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:scale-95"
          onClick={() => setMessage('クリックされました！')}
        >
          Click
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${hovered ? 'bg-purple-600' : 'bg-slate-500'}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          Hover me
        </button>
      </div>
      {hovered && <p className="text-xs text-purple-600">ホバー中です！</p>}
    </div>
  )
}
