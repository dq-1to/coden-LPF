import { useState, useCallback } from 'react'

function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue((v) => !v), [])
  return [value, toggle]
}

export default function CustomHookPreview() {
  const [isDark, toggleDark] = useToggle(false)
  const [isOpen, toggleOpen] = useToggle(false)

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium active:scale-95 ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-800'}`}
          onClick={toggleDark}
        >
          {isDark ? '🌙 Dark' : '☀️ Light'}
        </button>
        <button
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:scale-95"
          onClick={toggleOpen}
        >
          {isOpen ? 'パネルを閉じる' : 'パネルを開く'}
        </button>
      </div>
      {isOpen && (
        <div className={`rounded-md border px-3 py-2 text-sm ${isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
          useToggle フックで状態管理を再利用しています
        </div>
      )}
      <p className="text-xs text-slate-500">同じ useToggle を2箇所で使用</p>
    </div>
  )
}
