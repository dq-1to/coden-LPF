import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Loader2, Shield } from 'lucide-react'
import { formatJstDateTime } from '../../../lib/dateFormat'
import { getUserBasicInfo } from '../../../services/adminUsersService'
import type { AdminUserBasic } from '../../../services/adminUsersService'

interface FeedbackUserInfoProps {
  userId: string
}

export function FeedbackUserInfo({ userId }: FeedbackUserInfoProps) {
  const [userBasic, setUserBasic] = useState<AdminUserBasic | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError(null)

    getUserBasicInfo(userId)
      .then((basic) => {
        if (isMounted) setUserBasic(basic)
      })
      .catch((e: unknown) => {
        if (!isMounted) return
        setError(e instanceof Error ? e.message : 'ユーザー情報の取得に失敗しました')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [userId])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-700">ユーザー情報</h2>
        <Link
          to={`/admin/users/${userId}`}
          className="text-xs font-medium text-primary-mint hover:text-primary-mint/80"
        >
          ユーザー詳細へ →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2
            className="h-5 w-5 animate-spin text-slate-400"
            aria-label="ユーザー情報を読み込み中"
          />
        </div>
      ) : error ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : userBasic ? (
        <dl className="space-y-3 text-sm">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt className="w-32 shrink-0 font-medium text-slate-500">表示名</dt>
            <dd className="flex flex-wrap items-center gap-2 text-slate-800">
              <span>{userBasic.displayName ?? '—'}</span>
              {userBasic.isAdmin && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  <Shield className="h-3 w-3" aria-hidden="true" />
                  ADMIN
                </span>
              )}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt className="w-32 shrink-0 font-medium text-slate-500">メールアドレス</dt>
            <dd className="break-all text-slate-800">{userBasic.email ?? '—'}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt className="w-32 shrink-0 font-medium text-slate-500">管理者</dt>
            <dd className="text-slate-800">{userBasic.isAdmin ? 'はい' : 'いいえ'}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt className="w-32 shrink-0 font-medium text-slate-500">登録日</dt>
            <dd className="text-slate-800">{formatJstDateTime(userBasic.createdAt)}</dd>
          </div>
        </dl>
      ) : (
        <p className="text-xs text-slate-500">ユーザー情報を取得できませんでした</p>
      )}
    </section>
  )
}
