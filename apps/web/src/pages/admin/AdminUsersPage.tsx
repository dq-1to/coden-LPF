import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Search, Shield, Users } from 'lucide-react'
import { AdminLayout } from '../../features/admin/components/AdminLayout'
import { formatJstDate } from '../../lib/dateFormat'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Spinner } from '../../components/Spinner'
import { listUsers, type AdminUserSummary } from '../../services/adminUsersService'

export function AdminUsersPage() {
  useDocumentTitle('ユーザー一覧 - 管理画面')

  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    let isMounted = true
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await listUsers()
        if (!isMounted) return
        setUsers(data)
      } catch (e) {
        if (!isMounted) return
        setError(e instanceof Error ? e.message : 'ユーザー一覧の取得に失敗しました')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    void load()
    return () => {
      isMounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (q === '') return users
    return users.filter((u) => {
      const email = (u.email ?? '').toLowerCase()
      const name = (u.displayName ?? '').toLowerCase()
      return email.includes(q) || name.includes(q) || u.userId.toLowerCase().includes(q)
    })
  }, [users, keyword])

  return (
    <AdminLayout>
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">ユーザー一覧</h1>
        <p className="mt-1 text-sm text-slate-500">
          登録ユーザーの学習状況・累計ポイント・取得バッジ数を確認できます。
        </p>
      </div>

      {/* 検索 */}
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
        <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <label htmlFor="user-search" className="sr-only">
          ユーザーを検索
        </label>
        <input
          id="user-search"
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="メールアドレス・表示名・ユーザー ID で検索"
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
        <span className="shrink-0 text-xs text-slate-400">
          {filtered.length} / {users.length}
        </span>
      </div>

      {/* コンテンツ */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
          <Users className="h-10 w-10 text-slate-300" aria-hidden="true" />
          <p className="text-sm text-slate-500">該当するユーザーはいません</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3">ユーザー</th>
                <th scope="col" className="px-5 py-3">ポイント</th>
                <th scope="col" className="px-5 py-3">連続 / 最大</th>
                <th scope="col" className="px-5 py-3">最終学習日</th>
                <th scope="col" className="px-5 py-3">バッジ</th>
                <th scope="col" className="px-5 py-3">登録日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.userId} className="transition hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link
                      to={`/admin/users/${u.userId}`}
                      className="inline-flex flex-col gap-0.5 text-slate-800 hover:text-primary-dark"
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        {u.displayName ?? '(未設定)'}
                        {u.isAdmin && (
                          <span
                            className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
                            title="管理者"
                          >
                            <Shield className="h-3 w-3" aria-hidden="true" />
                            ADMIN
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-500">{u.email ?? '(email 取得不可)'}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-700">{u.totalPoints.toLocaleString()}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {u.currentStreak} / {u.maxStreak}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{formatJstDate(u.lastStudyDate)}</td>
                  <td className="px-5 py-3 text-slate-600">{u.badgeCount}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{formatJstDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
