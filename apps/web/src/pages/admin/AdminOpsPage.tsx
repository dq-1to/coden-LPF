import { useEffect, useState } from 'react'
import { AlertCircle, Award, CheckCircle2, Loader2, Plus } from 'lucide-react'
import { AdminLayout } from '../../features/admin/components/AdminLayout'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import {
  MAX_GRANT_POINTS_AMOUNT,
  MAX_GRANT_POINTS_REASON_LENGTH,
  grantBadge,
  grantPoints,
} from '../../services/adminOpsService'
import { BADGE_DEFINITIONS, type BadgeId } from '../../services/achievementService'
import { listUsers, type AdminUserSummary } from '../../services/adminUsersService'

type Feedback =
  | { kind: 'idle' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }

export function AdminOpsPage() {
  useDocumentTitle('運用 - 管理画面')

  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        const data = await listUsers()
        if (!isMounted) return
        setUsers(data)
      } catch (e) {
        if (!isMounted) return
        setUsersError(e instanceof Error ? e.message : 'ユーザー一覧の取得に失敗しました')
      } finally {
        if (isMounted) setIsLoadingUsers(false)
      }
    }
    void load()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">運用</h1>
        <p className="mt-1 text-sm text-slate-500">
          ポイント・バッジの手動付与を実行します。操作は admin_audit_log に記録されます。
        </p>
      </div>

      {usersError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{usersError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GrantPointsForm users={users} disabled={isLoadingUsers} />
        <GrantBadgeForm users={users} disabled={isLoadingUsers} />
      </div>
    </AdminLayout>
  )
}

// ─── ポイント手動付与 ─────────────────────────────────────

function GrantPointsForm({ users, disabled }: { users: AdminUserSummary[]; disabled: boolean }) {
  const [targetUserId, setTargetUserId] = useState('')
  const [amount, setAmount] = useState<number | ''>(100)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>({ kind: 'idle' })

  const canSubmit =
    !disabled &&
    !isSubmitting &&
    targetUserId.length > 0 &&
    typeof amount === 'number' &&
    amount > 0 &&
    amount <= MAX_GRANT_POINTS_AMOUNT &&
    reason.trim().length > 0 &&
    reason.length <= MAX_GRANT_POINTS_REASON_LENGTH

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || typeof amount !== 'number') return

    setIsSubmitting(true)
    setFeedback({ kind: 'idle' })
    try {
      await grantPoints({ targetUserId, amount, reason: reason.trim() })
      setFeedback({ kind: 'success', message: `${amount} Pt を付与しました` })
      // 成功後はフィールドを初期化（対象は残す）
      setReason('')
    } catch (e) {
      setFeedback({
        kind: 'error',
        message: e instanceof Error ? e.message : 'ポイントの付与に失敗しました',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Plus className="h-4 w-4" aria-hidden="true" />
        ポイント手動付与
      </h2>

      <FormFeedback feedback={feedback} />

      <UserSelect id="grant-points-user" value={targetUserId} onChange={setTargetUserId} users={users} disabled={disabled} />

      <div>
        <label htmlFor="grant-amount" className="mb-1 block text-xs font-semibold text-slate-600">
          金額 (Pt, 1〜{MAX_GRANT_POINTS_AMOUNT.toLocaleString()})
        </label>
        <input
          id="grant-amount"
          type="number"
          min={1}
          max={MAX_GRANT_POINTS_AMOUNT}
          step={1}
          value={amount}
          onChange={(e) => {
            const v = e.target.value
            setAmount(v === '' ? '' : Number(v))
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
          required
        />
      </div>

      <div>
        <label htmlFor="grant-reason" className="mb-1 block text-xs font-semibold text-slate-600">
          理由 ({reason.length} / {MAX_GRANT_POINTS_REASON_LENGTH})
        </label>
        <input
          id="grant-reason"
          type="text"
          value={reason}
          maxLength={MAX_GRANT_POINTS_REASON_LENGTH}
          onChange={(e) => setReason(e.target.value)}
          placeholder="例: キャンペーン参加ボーナス"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          {isSubmitting ? '付与中...' : 'ポイントを付与'}
        </button>
      </div>
    </form>
  )
}

// ─── バッジ手動付与 ───────────────────────────────────────

function GrantBadgeForm({ users, disabled }: { users: AdminUserSummary[]; disabled: boolean }) {
  const [targetUserId, setTargetUserId] = useState('')
  const [badgeId, setBadgeId] = useState<BadgeId>(BADGE_DEFINITIONS[0].id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>({ kind: 'idle' })

  const canSubmit = !disabled && !isSubmitting && targetUserId.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setIsSubmitting(true)
    setFeedback({ kind: 'idle' })
    try {
      await grantBadge({ targetUserId, badgeId })
      const def = BADGE_DEFINITIONS.find((b) => b.id === badgeId)
      setFeedback({
        kind: 'success',
        message: `バッジ「${def?.name ?? badgeId}」を付与しました`,
      })
    } catch (e) {
      setFeedback({
        kind: 'error',
        message: e instanceof Error ? e.message : 'バッジの付与に失敗しました',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Award className="h-4 w-4" aria-hidden="true" />
        バッジ手動付与
      </h2>

      <FormFeedback feedback={feedback} />

      <UserSelect id="grant-badge-user" value={targetUserId} onChange={setTargetUserId} users={users} disabled={disabled} />

      <div>
        <label htmlFor="grant-badge" className="mb-1 block text-xs font-semibold text-slate-600">
          バッジ
        </label>
        <select
          id="grant-badge"
          value={badgeId}
          onChange={(e) => setBadgeId(e.target.value as BadgeId)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
        >
          {BADGE_DEFINITIONS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} — {b.description}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Award className="h-4 w-4" aria-hidden="true" />
          )}
          {isSubmitting ? '付与中...' : 'バッジを付与'}
        </button>
      </div>
    </form>
  )
}

// ─── 共通部品 ─────────────────────────────────────────────

function UserSelect({
  id,
  value,
  onChange,
  users,
  disabled,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  users: AdminUserSummary[]
  disabled: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-slate-600">
        対象ユーザー
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint disabled:cursor-not-allowed disabled:opacity-60"
        required
      >
        <option value="">-- 選択してください --</option>
        {users.map((u) => (
          <option key={u.userId} value={u.userId}>
            {u.displayName ?? '(未設定)'} / {u.email ?? u.userId.slice(0, 8)}
          </option>
        ))}
      </select>
    </div>
  )
}

function FormFeedback({ feedback }: { feedback: Feedback }) {
  if (feedback.kind === 'idle') return null
  if (feedback.kind === 'success') {
    return (
      <div role="status" className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <p>{feedback.message}</p>
      </div>
    )
  }
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
    >
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <p>{feedback.message}</p>
    </div>
  )
}
