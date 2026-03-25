import { useEffect, useState } from 'react'

type Task = { id: number; title: string; done: boolean }

const mockTasks: Task[] = [
  { id: 1, title: '買い物に行く', done: false },
  { id: 2, title: 'レポートを書く', done: true },
  { id: 3, title: 'コードレビュー', done: false },
]

export default function ApiTaskListPreview() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = setTimeout(() => {
      setTasks(mockTasks)
      setLoading(false)
    }, 700)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-500">GET /api/tasks</p>
      {loading ? (
        <p className="text-sm text-slate-400 animate-pulse">読み込み中…</p>
      ) : (
        <ul className="space-y-1">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-2 text-sm">
              <span className={t.done ? 'text-emerald-500' : 'text-slate-300'}>{t.done ? '✓' : '○'}</span>
              <span className={t.done ? 'text-slate-400 line-through' : 'text-slate-700'}>{t.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
