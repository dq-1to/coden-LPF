import { useEffect, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { AdminLayout } from '../../features/admin/components/AdminLayout'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import {
  getDauLast30Days,
  getGlobalStatsSummary,
  getStepCompletionRates,
  getTopMissedQuestions,
  type DauPoint,
  type GlobalStatsSummary,
  type MissedQuestion,
  type StepCompletionRate,
} from '../../services/adminStatsService'
import { findStepById } from '../../content/courseData'

function stepLabel(stepId: string): string {
  return findStepById(stepId)?.title ?? stepId
}

function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

interface StatsState {
  summary: GlobalStatsSummary | null
  dau: DauPoint[]
  completion: StepCompletionRate[]
  missed: MissedQuestion[]
}

export function AdminStatsPage() {
  useDocumentTitle('統計 - 管理画面')

  const [state, setState] = useState<StatsState>({ summary: null, dau: [], completion: [], missed: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [summary, dau, completion, missed] = await Promise.all([
          getGlobalStatsSummary(),
          getDauLast30Days(),
          getStepCompletionRates(),
          getTopMissedQuestions(10, 3),
        ])
        if (!isMounted) return
        setState({ summary, dau, completion, missed })
      } catch (e) {
        if (!isMounted) return
        setError(e instanceof Error ? e.message : '統計データの取得に失敗しました')
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">統計</h1>
        <p className="mt-1 text-sm text-slate-500">
          DAU・ステップ別完了率・よく間違える問題を俯瞰します。
        </p>
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
      ) : (
        <div className="space-y-6">
          {/* サマリー */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard label="登録ユーザー" value={state.summary?.totalUsers ?? 0} />
            <SummaryCard
              label="配布済 Pt"
              value={(state.summary?.totalPointsDistributed ?? 0).toLocaleString()}
            />
            <SummaryCard label="フィードバック" value={state.summary?.totalFeedback ?? 0} />
            <SummaryCard
              label="新規フィードバック"
              value={state.summary?.newFeedback ?? 0}
              {...(state.summary && state.summary.newFeedback > 0
                ? { accent: 'text-amber-700' }
                : {})}
            />
          </section>

          {/* DAU 棒グラフ */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">DAU（過去 30 日 / JST）</h2>
            <DauChart points={state.dau} />
          </section>

          {/* ステップ別完了率 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              ステップ別完了率（着手ユーザー中の完了割合 / 低い順）
            </h2>
            {state.completion.length === 0 ? (
              <p className="text-sm text-slate-500">データがありません</p>
            ) : (
              <ul className="space-y-2">
                {state.completion.map((row) => (
                  <li key={row.stepId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate text-slate-700">{stepLabel(row.stepId)}</span>
                      <span className="shrink-0 font-mono text-xs text-slate-500">
                        {row.completedUsers} / {row.totalUsers} ({formatPercent(row.completionRate)})
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-primary-mint transition-[width] duration-500"
                        style={{ width: `${Math.max(2, row.completionRate * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 失敗率が高い問題 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              よく間違える問題 TOP 10（試行 3 回以上）
            </h2>
            {state.missed.length === 0 ? (
              <p className="text-sm text-slate-500">該当データがありません</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th scope="col" className="px-3 py-2">ステップ</th>
                      <th scope="col" className="px-3 py-2">試行</th>
                      <th scope="col" className="px-3 py-2">不正解</th>
                      <th scope="col" className="px-3 py-2">失敗率</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.missed.map((row) => (
                      <tr key={row.stepId}>
                        <td className="px-3 py-2 text-slate-700">{stepLabel(row.stepId)}</td>
                        <td className="px-3 py-2 font-mono text-slate-600">{row.attemptCount}</td>
                        <td className="px-3 py-2 font-mono text-rose-700">{row.failureCount}</td>
                        <td className="px-3 py-2 font-mono text-rose-700">{formatPercent(row.failureRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </AdminLayout>
  )
}

// ─── 内部部品 ──────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string
  value: React.ReactNode
  accent?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-semibold ${accent ?? 'text-slate-900'}`}>{value}</p>
    </div>
  )
}

function DauChart({ points }: { points: DauPoint[] }) {
  if (points.length === 0) {
    return <p className="text-sm text-slate-500">データがありません</p>
  }
  const max = Math.max(1, ...points.map((p) => p.activeUsers))
  return (
    <div>
      <div className="flex h-40 items-end gap-1">
        {points.map((p) => {
          const h = Math.max(2, (p.activeUsers / max) * 100)
          return (
            <div key={p.date} className="group relative flex-1 min-w-0">
              <div
                className="w-full rounded-t bg-primary-mint/70 transition group-hover:bg-primary-mint"
                style={{ height: `${h}%` }}
                aria-label={`${p.date}: ${p.activeUsers} 人`}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                {p.date}: {p.activeUsers}
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-slate-400">
        <span>{points[0]?.date}</span>
        <span>{points[points.length - 1]?.date}</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        最大 {max} 人 / 平均{' '}
        {(points.reduce((s, p) => s + p.activeUsers, 0) / points.length).toFixed(1)} 人
      </p>
    </div>
  )
}
