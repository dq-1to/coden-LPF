import { useState } from 'react'

type Task = { id: number; title: string }

export default function ApiTaskCreatePreview() {
  const [tasks, setTasks] = useState<Task[]>([{ id: 1, title: '既存タスク' }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  function handleCreate() {
    const trimmed = input.trim()
    if (!trimmed) return
    setSending(true)
    setTimeout(() => {
      setTasks((prev) => [...prev, { id: Date.now(), title: trimmed }])
      setInput('')
      setSending(false)
    }, 400)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-500">POST /api/tasks</p>
      <ul className="space-y-1">
        {tasks.map((t) => (
          <li key={t.id} className="text-sm text-slate-700">• {t.title}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          className="rounded border border-slate-300 px-2 py-1 text-sm"
          placeholder="新しいタスク"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button
          className="rounded-lg bg-emerald-600 px-3 py-2 min-h-[44px] text-sm font-medium text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          onClick={handleCreate}
          disabled={sending}
        >
          {sending ? '作成中…' : '作成'}
        </button>
      </div>
    </div>
  )
}
