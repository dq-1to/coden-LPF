import { useCallback, useState } from 'react'

type Task = { id: number; title: string; done: boolean }

function useTasks(initialTasks: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const addTask = useCallback((title: string) => {
    setTasks((prev) => [...prev, { id: Date.now(), title, done: false }])
  }, [])

  const toggleTask = useCallback((id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }, [])

  const deleteTask = useCallback((id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { tasks, addTask, toggleTask, deleteTask }
}

export default function ApiCustomHookPreview() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks([
    { id: 1, title: 'サンプルタスク', done: false },
  ])
  const [input, setInput] = useState('')

  function handleAdd() {
    const trimmed = input.trim()
    if (trimmed) {
      addTask(trimmed)
      setInput('')
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-500">useTasks カスタムフック</p>
      <ul className="space-y-1">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-2 text-sm">
            <button
              className={`min-h-[44px] px-2 py-1 text-xs ${t.done ? 'text-emerald-500' : 'text-slate-300'}`}
              onClick={() => toggleTask(t.id)}
            >
              {t.done ? '✓' : '○'}
            </button>
            <span className={t.done ? 'text-slate-400 line-through' : 'text-slate-700'}>{t.title}</span>
            <button className="min-h-[44px] px-2 py-1 text-xs text-rose-400 hover:text-rose-600" onClick={() => deleteTask(t.id)}>
              ✗
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          className="rounded border border-slate-300 px-2 py-1 text-sm"
          placeholder="新しいタスク"
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
