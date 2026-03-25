import { useEffect, useState } from 'react'

type User = { id: number; name: string; email: string }

const mockUsers: User[] = [
  { id: 1, name: '田中太郎', email: 'tanaka@example.com' },
  { id: 2, name: '鈴木花子', email: 'suzuki@example.com' },
  { id: 3, name: '佐藤次郎', email: 'sato@example.com' },
]

export default function ApiFetchPreview() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = setTimeout(() => {
      setUsers(mockUsers)
      setLoading(false)
    }, 800)
    return () => clearTimeout(id)
  }, [])

  function handleRefresh() {
    setLoading(true)
    setUsers([])
    setTimeout(() => {
      setUsers(mockUsers)
      setLoading(false)
    }, 800)
  }

  return (
    <div className="space-y-3">
      {loading ? (
        <p className="text-sm text-slate-500 animate-pulse">データを読み込み中…</p>
      ) : (
        <ul className="space-y-1">
          {users.map((u) => (
            <li key={u.id} className="text-sm text-slate-700">
              <span className="font-medium">{u.name}</span>{' '}
              <span className="text-xs text-slate-400">{u.email}</span>
            </li>
          ))}
        </ul>
      )}
      <button
        className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 active:scale-95"
        onClick={handleRefresh}
      >
        再取得
      </button>
    </div>
  )
}
