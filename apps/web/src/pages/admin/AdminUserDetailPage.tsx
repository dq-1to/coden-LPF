import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Loader2, Shield } from 'lucide-react'
import { AdminLayout } from '../../features/admin/components/AdminLayout'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { getUserDetail, type AdminUserDetail } from '../../services/adminUsersService'
import { findStepById } from '../../content/courseData'
import { BADGE_DEFINITIONS } from '../../services/achievementService'

const BADGE_LABEL: Record<string, string> = Object.fromEntries(
  BADGE_DEFINITIONS.map((b) => [b.id, b.name]),
)

function formatJstDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatJstDate(value: string | null): string {
  if (!value) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  return new Date(value).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
}

function stepLabel(stepId: string): string {
  return findStepById(stepId)?.title ?? stepId
}

export function AdminUserDetailPage() {
  useDocumentTitle('ユーザー詳細 - 管理画面')
  const { id } = useParams<{ id: string }>()

  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setIsLoading(false)
      return
    }

    let isMounted = true
    const userId = id
    async function load() {
      try {
        const data = await getUserDetail(userId)
        if (!isMounted) return
        if (data === null) {
          setNotFound(true)
        } else {
          setDetail(data)
        }
      } catch (e) {
        if (!isMounted) return
        setError(e instanceof Error ? e.message : 'ユーザー情報の取得に失敗しました')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    void load()
    return () => {
      isMounted = false
    }
  }, [id])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-label="読み込み中" />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <BackLink />
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      </AdminLayout>
    )
  }

  if (notFound || !detail) {
    return (
      <AdminLayout>
        <BackLink />
        <p className="text-sm text-slate-500">ユーザーが見つかりません</p>
      </AdminLayout>
    )
  }

  const { profile, stats, stepProgress, recentSubmissions, dailyHistory, achievements, codeDoctor, miniProject, codeReading, baseNook, pointHistory } = detail

  return (
    <AdminLayout>
      <BackLink />

      {/* プロフィールヘッダー */}
      <section className="mb-6 flex flex-wrap items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex-1">
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            {profile.displayName ?? '(未設定)'}
            {profile.isAdmin && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                <Shield className="h-3 w-3" aria-hidden="true" />
                ADMIN
              </span>
            )}
          </h1>
          <p className="mt-1 break-all font-mono text-xs text-slate-500">{profile.userId}</p>
          <p className="mt-0.5 text-xs text-slate-400">登録: {formatJstDateTime(profile.createdAt)}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Metric label="累計 Pt" value={(stats?.totalPoints ?? 0).toLocaleString()} />
          <Metric label="連続日数" value={stats?.currentStreak ?? 0} />
          <Metric label="最大連続" value={stats?.maxStreak ?? 0} />
          <Metric label="最終学習" value={formatJstDate(stats?.lastStudyDate ?? null)} />
        </dl>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ステップ進捗 */}
        <Section title={`ステップ進捗 (${stepProgress.length})`}>
          {stepProgress.length === 0 ? (
            <EmptyRow>進捗はありません</EmptyRow>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {stepProgress.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-1 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-700">{stepLabel(p.step_id)}</p>
                    <p className="text-xs text-slate-400">{p.step_id}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs">
                    <Flag on={p.read_done} label="R" />
                    <Flag on={p.practice_done} label="P" />
                    <Flag on={p.test_done} label="T" />
                    <Flag on={p.challenge_done} label="C" />
                    {p.completed_at && (
                      <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        完了
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* 実績バッジ */}
        <Section title={`取得バッジ (${achievements.length})`}>
          {achievements.length === 0 ? (
            <EmptyRow>バッジは未取得です</EmptyRow>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {achievements.map((a) => (
                <li
                  key={a.id}
                  className="rounded-full bg-primary-mint/20 px-3 py-1 text-xs font-semibold text-primary-dark"
                  title={formatJstDateTime(a.earned_at)}
                >
                  {BADGE_LABEL[a.badge_id] ?? a.badge_id}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* 提出履歴 */}
        <Section title={`直近の提出 (${recentSubmissions.length})`}>
          {recentSubmissions.length === 0 ? (
            <EmptyRow>提出はありません</EmptyRow>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {recentSubmissions.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-slate-700">{stepLabel(s.step_id)}</p>
                    <p className="text-xs text-slate-400">{formatJstDateTime(s.submitted_at)}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      s.is_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {s.is_passed ? '合格' : '不合格'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* デイリー履歴 */}
        <Section title={`デイリー実施 (${dailyHistory.length})`}>
          {dailyHistory.length === 0 ? (
            <EmptyRow>実施履歴はありません</EmptyRow>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {dailyHistory.slice(0, 14).map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-slate-500">{d.challenge_date}</p>
                    <p className="truncate text-xs text-slate-400">{d.challenge_id}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs">
                    <span className="text-slate-500">+{d.points_earned} Pt</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        d.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {d.completed ? '完了' : '未完了'}
                    </span>
                  </div>
                </li>
              ))}
              {dailyHistory.length > 14 && (
                <li className="pt-2 text-center text-xs text-slate-400">
                  ... ほか {dailyHistory.length - 14} 件
                </li>
              )}
            </ul>
          )}
        </Section>

        {/* 実践モード進捗サマリ */}
        <Section title="実践モード">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Metric label="コードドクター" value={codeDoctor.filter((p) => p.solved).length} />
            <Metric label="ミニプロジェクト" value={miniProject.filter((p) => p.status === 'completed').length} />
            <Metric label="コードリーディング" value={codeReading.filter((p) => p.completed).length} />
            <Metric label="Base Nook 解答" value={baseNook.length} />
          </dl>
        </Section>

        {/* 直近のポイント履歴 */}
        <Section title={`直近のポイント (${pointHistory.length})`}>
          {pointHistory.length === 0 ? (
            <EmptyRow>ポイント履歴はありません</EmptyRow>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {pointHistory.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-slate-700">{p.reason}</p>
                    <p className="text-xs text-slate-400">{formatJstDateTime(p.created_at)}</p>
                  </div>
                  <span className={`shrink-0 font-mono text-xs ${p.amount >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {p.amount >= 0 ? '+' : ''}{p.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </AdminLayout>
  )
}

// ─── 内部部品 ──────────────────────────────────────────────

function BackLink() {
  return (
    <div className="mb-4">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        ユーザー一覧に戻る
      </Link>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">{title}</h2>
      {children}
    </section>
  )
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return <p className="py-2 text-xs text-slate-400">{children}</p>
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-mono text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  )
}

function Flag({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
        on ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
      }`}
      aria-label={`${label}: ${on ? '完了' : '未完了'}`}
    >
      {label}
    </span>
  )
}
