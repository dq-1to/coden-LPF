import { FlaskConical, Shield } from 'lucide-react'

interface AccountTypeBadgeProps {
  isAdmin: boolean
  isTestUser: boolean
}

/**
 * アカウント種別バッジ（一般 / 管理者 / テスト）。
 * is_admin と is_test_user は独立属性のため、両方 true なら ADMIN + TEST の
 * 複合表示になる。一般ユーザー（両方 false）は何も表示しない
 * （既存の ADMIN バッジが「該当する場合のみ表示」の規約だったため踏襲）。
 */
export function AccountTypeBadge({ isAdmin, isTestUser }: AccountTypeBadgeProps) {
  if (!isAdmin && !isTestUser) return null

  return (
    <>
      {isAdmin && (
        <span
          className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
          title="管理者"
        >
          <Shield className="h-3 w-3" aria-hidden="true" />
          ADMIN
        </span>
      )}
      {isTestUser && (
        <span
          className="inline-flex items-center gap-0.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600"
          title="テストアカウント（集計から除外）"
        >
          <FlaskConical className="h-3 w-3" aria-hidden="true" />
          TEST
        </span>
      )}
    </>
  )
}
