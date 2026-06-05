import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, BarChart3, ExternalLink, Loader2, Search, TrendingDown } from 'lucide-react'
import { AdminLayout } from '../../features/admin/components/AdminLayout'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import {
  getAdminStepInsights,
  type AdminQualityStepInsightSignal,
  type AdminStepInsight,
  type AdminStepInsights,
} from '../../services/adminQualityService'

const STEP_SIGNAL_LABELS: Record<AdminQualityStepInsightSignal, string> = {
  healthy: '順調',
  watch: '要観察',
  attention: '要対応',
  insufficient: 'データ不足',
}

const STEP_SIGNAL_STYLES: Record<AdminQualityStepInsightSignal, string> = {
  healthy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  watch: 'border-amber-200 bg-amber-50 text-amber-700',
  attention: 'border-rose-200 bg-rose-50 text-rose-700',
  insufficient: 'border-slate-200 bg-slate-50 text-slate-600',
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

export function AdminStepInsightsPage() {
  useDocumentTitle('Step Insights - 管理画面')

  const [insights, setInsights] = useState<AdminStepInsights | null>(null)
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getAdminStepInsights()
        if (!isMounted) return
        setInsights(data)
        setSelectedStepId(data.rows.find((row) => row.signal !== 'insufficient')?.stepId ?? data.rows[0]?.stepId ?? null)
      } catch (e) {
        if (!isMounted) return
        setError(e instanceof Error ? e.message : 'Step Insightsの取得に失敗しました')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    void load()
    return () => {
      isMounted = false
    }
  }, [])

  const selectedStep = useMemo(
    () => insights?.rows.find((row) => row.stepId === selectedStepId) ?? null,
    [insights, selectedStepId],
  )

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Step Insights</h1>
          <p className="mt-1 text-sm text-slate-500">
            learning_events からステップ別の遷移率・離脱率・誤答率を確認します。
          </p>
        </div>
        {insights && (
          <div className="text-xs text-slate-500">
            生成日時 <span className="font-mono text-slate-700">{formatDateTime(insights.generatedAt)}</span>
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
      ) : insights ? (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <OverviewTile label="イベント数" value={`${insights.totalEvents.toLocaleString()}件`} />
            <OverviewTile label="観測Step" value={`${insights.observedSteps.toLocaleString()}件`} />
            <OverviewTile label="要対応Step" value={`${insights.attentionSteps.toLocaleString()}件`} />
          </section>

          <Section title="ステップ別品質" icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />}>
            <StepInsightsTable rows={insights.rows} selectedStepId={selectedStepId} onSelect={setSelectedStepId} />
          </Section>

          {selectedStep && (
            <Section title="ドリルダウン" icon={<Search className="h-4 w-4" aria-hidden="true" />}>
              <StepDetailPanel row={selectedStep} />
            </Section>
          )}
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

function StepInsightsTable({
  rows,
  selectedStepId,
  onSelect,
}: {
  rows: AdminStepInsight[]
  selectedStepId: string | null
  onSelect: (stepId: string) => void
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
        Step Insights のデータがありません
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">Step</th>
            <th scope="col" className="px-4 py-3">状態</th>
            <th scope="col" className="px-4 py-3">開始</th>
            <th scope="col" className="px-4 py-3">遷移率</th>
            <th scope="col" className="px-4 py-3">離脱率</th>
            <th scope="col" className="px-4 py-3">Practice / Test</th>
            <th scope="col" className="px-4 py-3">Challenge</th>
            <th scope="col" className="px-4 py-3">Feedback</th>
            <th scope="col" className="px-4 py-3">詳細</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.stepId} className={selectedStepId === row.stepId ? 'bg-teal-50/40' : undefined}>
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-800">
                  Step {row.order}「{row.title}」
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-400">{row.stepId}</p>
                {row.courseTitle ? <p className="mt-1 text-xs text-slate-500">{row.courseTitle}</p> : null}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${STEP_SIGNAL_STYLES[row.signal]}`}
                >
                  {STEP_SIGNAL_LABELS[row.signal]}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-slate-700">{row.startedUsers}人</td>
              <td className="px-4 py-3 font-mono text-xs leading-5 text-slate-700">
                <p>R→P {formatPercent(row.readToPracticeRate)}</p>
                <p>P→T {formatPercent(row.practiceToTestRate)}</p>
                <p>T→C {formatPercent(row.testToChallengeRate)}</p>
              </td>
              <td className="px-4 py-3 font-mono text-slate-700">{formatPercent(row.dropoffRate)}</td>
              <td className="px-4 py-3 font-mono text-xs leading-5 text-slate-700">
                <p>Practice誤答 {formatPercent(row.practiceIncorrectRate)}</p>
                <p>Test失敗 {formatPercent(row.testFailureRate)}</p>
              </td>
              <td className="px-4 py-3 font-mono text-xs leading-5 text-slate-700">
                <p>{row.challengeSubmissions}件</p>
                <p>合格 {formatPercent(row.challengePassRate)}</p>
              </td>
              <td className="px-4 py-3 font-mono text-xs leading-5 text-slate-700">
                <p>{row.relatedFeedbackCount}件</p>
                <p>新規 {row.newFeedbackCount}件</p>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onSelect(row.stepId)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary-mint hover:text-slate-900"
                  aria-pressed={selectedStepId === row.stepId}
                >
                  詳細
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StepDetailPanel({ row }: { row: AdminStepInsight }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              Step {row.order}「{row.title}」
            </h3>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${STEP_SIGNAL_STYLES[row.signal]}`}
            >
              {STEP_SIGNAL_LABELS[row.signal]}
            </span>
          </div>
          <p className="mt-1 font-mono text-xs text-slate-400">{row.stepId}</p>
          {row.courseTitle ? <p className="mt-1 text-sm text-slate-500">{row.courseTitle}</p> : null}
        </div>
        <Link
          to={`/step/${row.stepId}`}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary-mint hover:text-slate-900"
        >
          Stepを開く
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <DetailMetric label="Read開始 / 完了" value={`${row.readStartedUsers} / ${row.readCompletedUsers}人`} />
        <DetailMetric
          label="Practice開始 / 完了"
          value={`${row.practiceStartedUsers} / ${row.practiceCompletedUsers}人`}
        />
        <DetailMetric label="Test開始 / 完了" value={`${row.testStartedUsers} / ${row.testCompletedUsers}人`} />
        <DetailMetric
          label="Challenge開始 / 完了"
          value={`${row.challengeStartedUsers} / ${row.challengeCompletedUsers}人`}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <DetailMetric label="完了率" value={formatPercent(row.completionRate)} />
        <DetailMetric label="イベント数" value={`${row.eventCount.toLocaleString()}件`} />
        <DetailMetric label="関連フィードバック" value={`${row.relatedFeedbackCount.toLocaleString()}件`} />
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <TrendingDown className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">主なボトルネック</p>
          <p className="mt-1">{row.bottleneck}</p>
        </div>
      </div>
    </div>
  )
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold text-slate-900">{value}</p>
    </div>
  )
}
