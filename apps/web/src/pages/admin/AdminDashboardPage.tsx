import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, BarChart3, Inbox, Loader2, Users, Wrench } from 'lucide-react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { AdminLayout } from '../../features/admin/components/AdminLayout'
import { getGlobalStatsSummary, type GlobalStatsSummary } from '../../services/adminStatsService'

interface SectionCard {
  to: string
  title: string
  description: string
  icon: typeof Inbox
  accent: string
  /** 表示するメトリクスキー（summary から取得） */
  metricKey?: keyof GlobalStatsSummary
  /** 「新規◯件」のようにカードの補足バッジに表示するメトリクスキー */
  badgeKey?: keyof GlobalStatsSummary
}

const SECTIONS: SectionCard[] = [
  {
    to: '/admin/feedback',
    title: 'フィードバック',
    description: 'ユーザーから届いた不具合報告・要望・レビューを確認する',
    icon: Inbox,
    accent: 'bg-amber-100 text-amber-700',
    metricKey: 'totalFeedback',
    badgeKey: 'newFeedback',
  },
  {
    to: '/admin/users',
    title: 'ユーザー',
    description: '登録ユーザーの学習進捗・ポイント・取得バッジを閲覧する',
    icon: Users,
    accent: 'bg-sky-100 text-sky-700',
    metricKey: 'totalUsers',
  },
  {
    to: '/admin/stats',
    title: '統計',
    description: 'DAU・ステップ別完了率・よく間違える問題などを俯瞰する',
    icon: BarChart3,
    accent: 'bg-emerald-100 text-emerald-700',
    metricKey: 'totalPointsDistributed',
  },
  {
    to: '/admin/ops',
    title: '運用',
    description: 'ポイント・バッジの手動付与など、運用オペレーションを実行する',
    icon: Wrench,
    accent: 'bg-violet-100 text-violet-700',
  },
]

const METRIC_LABELS: Record<keyof GlobalStatsSummary, string> = {
  totalUsers: '登録ユーザー',
  totalPointsDistributed: '配布済 Pt',
  totalFeedback: '累計件数',
  newFeedback: '新規',
}

export function AdminDashboardPage() {
  useDocumentTitle('管理画面')

  const [summary, setSummary] = useState<GlobalStatsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        const data = await getGlobalStatsSummary()
        if (!isMounted) return
        setSummary(data)
      } catch (e) {
        if (!isMounted) return
        setError(e instanceof Error ? e.message : 'ダッシュボードの取得に失敗しました')
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
        <h1 className="text-2xl font-bold text-slate-900">管理画面</h1>
        <p className="mt-1 text-sm text-slate-500">
          Coden の運用状況を把握し、ユーザーサポート・データ確認を行う管理者向けダッシュボード。
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon
          const metricValue =
            section.metricKey && summary ? summary[section.metricKey] : null
          const badgeValue =
            section.badgeKey && summary ? summary[section.badgeKey] : null

          return (
            <Link
              key={section.to}
              to={section.to}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-mint/40 hover:shadow-md"
            >
              <div className={`rounded-xl p-3 ${section.accent}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold text-slate-900 group-hover:text-primary-dark">
                    {section.title}
                  </h2>
                  {badgeValue !== null && badgeValue > 0 && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      {METRIC_LABELS[section.badgeKey as keyof GlobalStatsSummary]} {badgeValue}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">{section.description}</p>

                {section.metricKey && (
                  <p className="mt-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {METRIC_LABELS[section.metricKey]}:{' '}
                    </span>
                    {isLoading ? (
                      <Loader2 className="inline h-3 w-3 animate-spin text-slate-400" aria-hidden="true" />
                    ) : (
                      <span className="font-mono text-slate-800">
                        {metricValue !== null ? metricValue.toLocaleString() : '—'}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </AdminLayout>
  )
}
