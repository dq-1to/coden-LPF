import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { AdminLayout } from '../../features/admin/components/AdminLayout'
import { FeedbackNoteForm } from '../../features/admin/components/FeedbackNoteForm'
import { FeedbackStatusForm } from '../../features/admin/components/FeedbackStatusForm'
import { FeedbackUserInfo } from '../../features/admin/components/FeedbackUserInfo'
import { formatJstDateTime } from '../../lib/dateFormat'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import {
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATUS_LABELS,
  getFeedback,
  isFeedbackCategory,
  isFeedbackStatus,
} from '../../services/feedbackService'
import type { UserFeedback } from '../../services/feedbackService'
import { CATEGORY_BADGE_CLASSES, STATUS_BADGE_CLASSES } from '../../features/feedback/feedbackBadge'

// ─── Badge helpers ──────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const label = isFeedbackCategory(category) ? FEEDBACK_CATEGORY_LABELS[category] : category
  const classes = isFeedbackCategory(category) ? CATEGORY_BADGE_CLASSES[category] : 'bg-slate-100 text-slate-700'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const label = isFeedbackStatus(status) ? FEEDBACK_STATUS_LABELS[status] : status
  const classes = isFeedbackStatus(status) ? STATUS_BADGE_CLASSES[status] : 'bg-slate-100 text-slate-700'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  )
}

function BackLink() {
  return (
    <div className="mb-6">
      <Link
        to="/admin/feedback"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        一覧に戻る
      </Link>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AdminFeedbackDetailPage() {
  useDocumentTitle('フィードバック詳細 - 管理画面')

  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [feedback, setFeedback] = useState<UserFeedback | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setIsLoading(false)
      return
    }

    const feedbackId = id
    let isMounted = true

    async function load() {
      try {
        const data = await getFeedback(feedbackId)
        if (!isMounted) return
        if (data === null) {
          setNotFound(true)
          return
        }
        setFeedback(data)
      } catch (e) {
        if (!isMounted) return
        setLoadError(e instanceof Error ? e.message : 'フィードバックの取得に失敗しました')
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

  if (loadError) {
    return (
      <AdminLayout>
        <BackLink />
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{loadError}</p>
        </div>
      </AdminLayout>
    )
  }

  if (notFound || !feedback) {
    return (
      <AdminLayout>
        <BackLink />
        <p className="text-sm text-slate-500">フィードバックが見つかりません</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <BackLink />

      {/* Page heading */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-slate-900">フィードバック詳細</h1>
        <CategoryBadge category={feedback.category} />
        <StatusBadge status={feedback.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Message */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">メッセージ</h2>
            <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
              {feedback.message}
            </pre>
          </section>

          <FeedbackUserInfo userId={feedback.user_id} />

          {/* Meta info */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">詳細情報</h2>
            <dl className="space-y-3 text-sm">
              <MetaRow label="ユーザー ID">
                <span className="break-all font-mono text-slate-800">{feedback.user_id}</span>
              </MetaRow>
              <MetaRow label="カテゴリ">
                <CategoryBadge category={feedback.category} />
              </MetaRow>
              <MetaRow label="作成日時">{formatJstDateTime(feedback.created_at)}</MetaRow>
              <MetaRow label="更新日時">{formatJstDateTime(feedback.updated_at)}</MetaRow>
              {feedback.page_url && (
                <MetaRow label="ページ URL">
                  <span className="break-all">{feedback.page_url}</span>
                </MetaRow>
              )}
              {feedback.user_agent && (
                <MetaRow label="User Agent">
                  <span className="break-all text-xs text-slate-600">{feedback.user_agent}</span>
                </MetaRow>
              )}
            </dl>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {user && (
            <>
              <FeedbackStatusForm feedback={feedback} adminUserId={user.id} onUpdate={setFeedback} />
              <FeedbackNoteForm feedback={feedback} adminUserId={user.id} onUpdate={setFeedback} />
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="w-32 shrink-0 font-medium text-slate-500">{label}</dt>
      <dd className="text-slate-800">{children}</dd>
    </div>
  )
}
