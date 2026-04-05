import { useState } from 'react'

const initialFruits = ['りんご', 'バナナ', 'オレンジ']

export default function ListPreview() {
  const [fruits, setFruits] = useState(initialFruits)
  const [input, setInput] = useState('')

  function handleAdd() {
    const trimmed = input.trim()
    if (trimmed) {
      setFruits((prev) => [...prev, trimmed])
      setInput('')
    }
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-1">
        {fruits.map((fruit, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
            <span className="text-emerald-500">•</span>
            {fruit}
            <button
              className="min-h-[44px] px-2 py-1 text-xs text-rose-400 hover:text-rose-600"
              onClick={() => setFruits((prev) => prev.filter((_, j) => j !== i))}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          className="rounded border border-slate-300 px-3 py-2 min-h-[44px] text-sm"
          placeholder="フルーツ名"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          className="rounded-lg bg-emerald-600 px-3 py-2 min-h-[44px] text-sm font-medium text-white hover:bg-emerald-700 active:scale-95"
          onClick={handleAdd}
        >
          追加
        </button>
      </div>
    </div>
  )
}
