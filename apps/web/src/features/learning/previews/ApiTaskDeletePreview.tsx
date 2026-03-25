import { useState } from 'react'

type Task = { id: number; title: string }

const initial: Task[] = [
  { id: 1, title: '買い物に行く' },
  { id: 2, title: 'レポートを書く' },
  { id: 3, title: 'コードレビュー' },
]

export default function ApiTaskDeletePreview() {
  const [tasks, setTasks] = useState<Task[]>(initial)
  const [deleting, setDeleting] = useState<number | null>(null)

  function handleDelete(id: number) {
    setDeleting(id)
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id))
      setDeleting(null)
    }, 400)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-500">DELETE /api/tasks/:id</p>
      {tasks.length === 0 ? (
        <p className="text-sm text-slate-400">タスクがありません</p>
      ) : (
        <ul className="space-y-1">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-2 text-sm">
              <span className="text-slate-700">{t.title}</span>
              <button
                className="text-xs text-rose-400 hover:text-rose-600 disabled:opacity-50"
                onClick={() => handleDelete(t.id)}
                disabled={deleting === t.id}
              >
                {deleting === t.id ? '削除中…' : '削除'}
              </button>
            </li>
          ))}
        </ul>
      )}
      {tasks.length < initial.length && (
        <button
          className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
          onClick={() => setTasks(initial)}
        >
          リセット
        </button>
      )}
    </div>
  )
}
