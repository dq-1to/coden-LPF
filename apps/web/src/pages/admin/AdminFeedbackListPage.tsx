import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Inbox, Filter, AlertCircle } from 'lucide-react'
import { AdminLayout } from '../../features/admin/components/AdminLayout'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Spinner } from '../../components/Spinner'
import { formatJstDateTime } from '../../lib/dateFormat'
import {
  listFeedback,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATUS_LABELS,
  isFeedbackCategory,
  isFeedbackStatus,
  type FeedbackCategory,
  type FeedbackStatus,
  type ListFeedbackFilter,
  type UserFeedback,
} from '../../services/feedbackService'
import { CATEGORY_BADGE_CLASSES, STATUS_BADGE_CLASSES } from '../../features/feedback/feedbackBadge'

type CategoryFilter = 'all' | FeedbackCategory
type StatusFilter = 'all' | FeedbackStatus

export function AdminFeedbackListPage() {
  useDocumentTitle('フィードバック一覧 - 管理画面')

  const [feedback, setFeedback] = useState<UserFeedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    let isMounted = true

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const filter: ListFeedbackFilter = {}
        if (categoryFilter !== 'all') filter.category = categoryFilter
        if (statusFilter !== 'all') filter.status = statusFilter
        const data = await listFeedback(filter)
        if (!isMounted) return
        setFeedback(data)
      } catch (e) {
        if (!isMounted) return
        setError(e instanceof Error ? e.message : 'データの取得に失敗しました')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [categoryFilter, statusFilter])

  return (
    <AdminLayout>
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">フィードバック一覧</h1>
        <p className="mt-1 text-sm text-slate-500">
          ユーザーから届いた不具合報告・要望・レビューを確認できます。
        </p>
      </div>

      {/* フィルター */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <Filter className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />

        <div className="flex items-center gap-2">
          <label htmlFor="category-filter" className="text-sm font-medium text-slate-600">
            カテゴリ
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-mint"
          >
            <option value="all">すべて</option>
            <option value="bug">{FEEDBACK_CATEGORY_LABELS.bug}</option>
            <option value="review">{FEEDBACK_CATEGORY_LABELS.review}</option>
            <option value="request">{FEEDBACK_CATEGORY_LABELS.request}</option>
            <option value="other">{FEEDBACK_CATEGORY_LABELS.other}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm font-medium text-slate-600">
            ステータス
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-mint"
          >
            <option value="all">すべて</option>
            <option value="new">{FEEDBACK_STATUS_LABELS.new}</option>
            <option value="in_progress">{FEEDBACK_STATUS_LABELS.in_progress}</option>
            <option value="resolved">{FEEDBACK_STATUS_LABELS.resolved}</option>
            <option value="archived">{FEEDBACK_STATUS_LABELS.archived}</option>
          </select>
        </div>
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
      ) : feedback.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
          <Inbox className="h-10 w-10 text-slate-300" aria-hidden="true" />
          <p className="text-sm text-slate-500">該当するフィードバックはありません</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {feedback.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/admin/feedback/${item.id}`}
                  className="flex items-start gap-4 px-5 py-4 transition hover:bg-slate-50"
                >
                  {/* バッジ列 */}
                  <div className="flex shrink-0 flex-col gap-1.5 pt-0.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${isFeedbackCategory(item.category) ? CATEGORY_BADGE_CLASSES[item.category] : 'bg-slate-100 text-slate-600'}`}
                    >
                      {isFeedbackCategory(item.category) ? FEEDBACK_CATEGORY_LABELS[item.category] : item.category}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${isFeedbackStatus(item.status) ? STATUS_BADGE_CLASSES[item.status] : 'bg-slate-100 text-slate-600'}`}
                    >
                      {isFeedbackStatus(item.status) ? FEEDBACK_STATUS_LABELS[item.status] : item.status}
                    </span>
                  </div>

                  {/* メッセージ */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm text-slate-700">
                      {item.message.length > 200 ? item.message.slice(0, 200) : item.message}
                    </p>
                  </div>

                  {/* 日時 */}
                  <time
                    dateTime={item.created_at}
                    className="shrink-0 text-xs text-slate-400"
                  >
                    {formatJstDateTime(item.created_at)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminLayout>
  )
}
