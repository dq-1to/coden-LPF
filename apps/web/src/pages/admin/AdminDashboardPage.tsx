import { Link } from 'react-router-dom'
import { Inbox, Users, BarChart3, Wrench } from 'lucide-react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { AdminLayout } from '../../features/admin/components/AdminLayout'

interface SectionCard {
  to: string
  title: string
  description: string
  icon: typeof Inbox
  accent: string
}

const SECTIONS: SectionCard[] = [
  {
    to: '/admin/feedback',
    title: 'フィードバック',
    description: 'ユーザーから届いた不具合報告・要望・レビューを確認する',
    icon: Inbox,
    accent: 'bg-amber-100 text-amber-700',
  },
  {
    to: '/admin/users',
    title: 'ユーザー',
    description: '登録ユーザーの学習進捗・ポイント・取得バッジを閲覧する',
    icon: Users,
    accent: 'bg-sky-100 text-sky-700',
  },
  {
    to: '/admin/stats',
    title: '統計',
    description: 'DAU・ステップ別完了率・よく間違える問題などを俯瞰する',
    icon: BarChart3,
    accent: 'bg-emerald-100 text-emerald-700',
  },
  {
    to: '/admin/ops',
    title: '運用',
    description: 'ポイント・バッジの手動付与など、運用オペレーションを実行する',
    icon: Wrench,
    accent: 'bg-violet-100 text-violet-700',
  },
]

export function AdminDashboardPage() {
  useDocumentTitle('管理画面')

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">管理画面</h1>
        <p className="mt-1 text-sm text-slate-500">
          Coden の運用状況を把握し、ユーザーサポート・データ確認を行う管理者向けダッシュボード。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.to}
              to={section.to}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-mint/40 hover:shadow-md"
            >
              <div className={`rounded-xl p-3 ${section.accent}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 group-hover:text-primary-dark">{section.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                <p className="mt-3 text-xs font-semibold text-slate-400">※ M2 以降で実装予定</p>
              </div>
            </Link>
          )
        })}
      </div>
    </AdminLayout>
  )
}
