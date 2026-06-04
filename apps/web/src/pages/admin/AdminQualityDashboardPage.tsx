import { useEffect, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Clock3, Loader2, ShieldCheck, TrendingUp } from 'lucide-react'
import { AdminLayout } from '../../features/admin/components/AdminLayout'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import {
  getAdminQualityDashboard,
  type AdminQualityDashboard,
  type AdminQualityMetric,
  type AdminQualityMetricStatus,
  type AdminQualityStepPriority,
} from '../../services/adminQualityService'

const STATUS_LABELS: Record<AdminQualityMetricStatus, string> = {
  formal: '正式表示',
  provisional: '暫定表示',
  future: 'M2以降',
}

const STATUS_STYLES: Record<AdminQualityMetricStatus, string> = {
  formal: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  provisional: 'border-amber-200 bg-amber-50 text-amber-700',
  future: 'border-slate-200 bg-slate-50 text-slate-600',
}

function formatPercent(rate: number | null): string {
  if (rate === null) return 'データ不足'
  return `${(rate * 100).toFixed(1)}%`
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function AdminQualityDashboardPage() {
  useDocumentTitle('品質ダッシュボード - 管理画面')

  const [dashboard, setDashboard] = useState<AdminQualityDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getAdminQualityDashboard()
        if (!isMounted) return
        setDashboard(data)
      } catch (e) {
        if (!isMounted) return
        setError(e instanceof Error ? e.message : '品質ダッシュボードの取得に失敗しました')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    void load()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">品質ダッシュボード</h1>
          <p className="mt-1 text-sm text-slate-500">
            既存データから学習品質KPIと改善優先ステップを確認します。
          </p>
        </div>
        {dashboard && (
          <div className="text-xs text-slate-500">
            生成日時 <span className="font-mono text-slate-700">{formatDateTime(dashboard.generatedAt)}</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-label="読み込み中" />
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : dashboard ? (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <OverviewTile label="登録ユーザー" value={`${dashboard.totalUsers.toLocaleString()}人`} />
            <OverviewTile label="着手ユーザー" value={`${dashboard.activeLearners.toLocaleString()}人`} />
            <OverviewTile
              label="改善候補"
              value={`${dashboard.improvementSteps.length.toLocaleString()}件`}
            />
          </section>

          <Section title="正式KPI" icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}>
            <MetricGrid metrics={dashboard.formalMetrics} />
          </Section>

          <Section title="暫定KPI" icon={<Clock3 className="h-4 w-4" aria-hidden="true" />}>
            <MetricGrid metrics={dashboard.provisionalMetrics} />
          </Section>

          <Section title="改善優先ステップ Top5" icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />}>
            <ImprovementTable rows={dashboard.improvementSteps} />
          </Section>

          <Section title="Mini Project状況" icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <OverviewTile label="合計" value={`${dashboard.miniProjectStatus.total.toLocaleString()}件`} />
              <OverviewTile label="完了" value={`${dashboard.miniProjectStatus.completed.toLocaleString()}件`} />
              <OverviewTile
                label="進行中"
                value={`${dashboard.miniProjectStatus.inProgress.toLocaleString()}件`}
              />
              <OverviewTile
                label="未着手"
                value={`${dashboard.miniProjectStatus.notStarted.toLocaleString()}件`}
              />
            </div>
          </Section>

          <Section title="M2以降に正式化するKPI" icon={<Clock3 className="h-4 w-4" aria-hidden="true" />}>
            <MetricGrid metrics={dashboard.futureMetrics} />
          </Section>
        </div>
      ) : null}
    </AdminLayout>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="text-slate-500">{icon}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function OverviewTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function MetricGrid({ metrics }: { metrics: AdminQualityMetric[] }) {
  if (metrics.length === 0) {
    return <p className="text-sm text-slate-500">データがありません</p>
  }
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <article key={metric.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-700">{metric.label}</h3>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[metric.status]}`}
            >
              {STATUS_LABELS[metric.status]}
            </span>
          </div>
          <p className="mt-3 font-mono text-2xl font-semibold text-slate-900">{metric.value}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{metric.detail}</p>
        </article>
      ))}
    </div>
  )
}

function ImprovementTable({ rows }: { rows: AdminQualityStepPriority[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
        改善優先ステップの候補はありません
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">Step</th>
            <th scope="col" className="px-4 py-3">優先度</th>
            <th scope="col" className="px-4 py-3">完了率</th>
            <th scope="col" className="px-4 py-3">Challenge</th>
            <th scope="col" className="px-4 py-3">理由</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.stepId}>
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-800">
                  Step {row.order}「{row.title}」
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-400">{row.stepId}</p>
              </td>
              <td className="px-4 py-3 font-mono text-slate-800">{row.priorityScore.toFixed(1)}</td>
              <td className="px-4 py-3 font-mono text-slate-700">
                {row.completedUsers} / {row.startedUsers} ({formatPercent(row.completionRate)})
              </td>
              <td className="px-4 py-3 font-mono text-slate-700">
                {row.challengeSubmissions}件 / {formatPercent(row.challengePassRate)}
              </td>
              <td className="px-4 py-3 text-xs leading-5 text-slate-500">
                {row.reasons.join(' / ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
