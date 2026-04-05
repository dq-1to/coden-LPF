import { useState } from 'react'

type Task = { id: number; title: string; done: boolean }

const initial: Task[] = [
  { id: 1, title: '買い物に行く', done: false },
  { id: 2, title: 'レポートを書く', done: false },
  { id: 3, title: 'コードレビュー', done: true },
]

export default function ApiTaskUpdatePreview() {
  const [tasks, setTasks] = useState<Task[]>(initial)
  const [updating, setUpdating] = useState<number | null>(null)

  function handleToggle(id: number) {
    setUpdating(id)
    setTimeout(() => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
      setUpdating(null)
    }, 400)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-500">PUT /api/tasks/:id</p>
      <ul className="space-y-1">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-2 text-sm">
            <button
              className={`rounded px-2 py-2 min-h-[44px] text-xs font-medium ${t.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'} ${updating === t.id ? 'opacity-50' : 'hover:opacity-80'}`}
              onClick={() => handleToggle(t.id)}
              disabled={updating === t.id}
            >
              {t.done ? '完了' : '未完了'}
            </button>
            <span className={t.done ? 'text-slate-400 line-through' : 'text-slate-700'}>{t.title}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
