import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Loader2, Save } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { AdminLayout } from '../../features/admin/components/AdminLayout'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATUSES,
  FEEDBACK_STATUS_LABELS,
  MAX_ADMIN_NOTE_LENGTH,
  getFeedback,
  updateFeedbackNote,
  updateFeedbackStatus,
} from '../../services/feedbackService'
import type { FeedbackCategory, FeedbackStatus, UserFeedback } from '../../services/feedbackService'

// ─── Badge helpers ──────────────────────────────────────────────────────────

const CATEGORY_BADGE_CLASSES: Record<FeedbackCategory, string> = {
  bug: 'bg-rose-100 text-rose-700',
  review: 'bg-sky-100 text-sky-700',
  request: 'bg-violet-100 text-violet-700',
  other: 'bg-slate-100 text-slate-700',
}

const STATUS_BADGE_CLASSES: Record<FeedbackStatus, string> = {
  new: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-sky-100 text-sky-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-slate-100 text-slate-700',
}

function isFeedbackCategory(value: string): value is FeedbackCategory {
  return FEEDBACK_CATEGORIES.has(value)
}

function isFeedbackStatus(value: string): value is FeedbackStatus {
  return FEEDBACK_STATUSES.has(value)
}

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

// ─── Date formatting ─────────────────────────────────────────────────────────

function formatJst(isoString: string): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(date)
    .replace(/\//g, '/')
    .replace(',', '')
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

  // Status update state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  // Admin note state
  const [noteText, setNoteText] = useState('')
  const [savedNote, setSavedNote] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [noteError, setNoteError] = useState<string | null>(null)
  const [noteSaveSuccess, setNoteSaveSuccess] = useState(false)

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
        } else {
          setFeedback(data)
          const initialNote = data.admin_note ?? ''
          setNoteText(initialNote)
          setSavedNote(initialNote)
        }
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

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!feedback || !user || !id) return
    const nextStatus = e.target.value
    if (!isFeedbackStatus(nextStatus)) return

    setIsUpdatingStatus(true)
    setStatusError(null)
    try {
      const updated = await updateFeedbackStatus(id, nextStatus, user.id)
      setFeedback(updated)
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'ステータスの更新に失敗しました')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function handleNoteSave() {
    if (!feedback || !user || !id) return

    setIsSavingNote(true)
    setNoteError(null)
    setNoteSaveSuccess(false)

    const trimmed = noteText.trim()
    const valueToSave = trimmed.length === 0 ? null : trimmed

    try {
      const updated = await updateFeedbackNote(id, valueToSave, user.id)
      setFeedback(updated)
      const savedValue = updated.admin_note ?? ''
      setNoteText(savedValue)
      setSavedNote(savedValue)
      setNoteSaveSuccess(true)
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : 'メモの保存に失敗しました')
    } finally {
      setIsSavingNote(false)
    }
  }

  const isNoteUnchanged = noteText === savedNote
  const isNoteOverLimit = noteText.length > MAX_ADMIN_NOTE_LENGTH

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-label="読み込み中" />
        </div>
      </AdminLayout>
    )
  }

  // ── Load error ────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <AdminLayout>
        <div className="mb-4">
          <Link
            to="/admin/feedback"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            一覧に戻る
          </Link>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{loadError}</p>
        </div>
      </AdminLayout>
    )
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !feedback) {
    return (
      <AdminLayout>
        <div className="mb-4">
          <Link
            to="/admin/feedback"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            一覧に戻る
          </Link>
        </div>
        <p className="text-sm text-slate-500">フィードバックが見つかりません</p>
      </AdminLayout>
    )
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      {/* Back link */}
      <div className="mb-6">
        <Link
          to="/admin/feedback"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          一覧に戻る
        </Link>
      </div>

      {/* Page heading */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-slate-900">フィードバック詳細</h1>
        <CategoryBadge category={feedback.category} />
        <StatusBadge status={feedback.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: read-only meta + message */}
        <div className="space-y-6 lg:col-span-2">
          {/* Message */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">メッセージ</h2>
            <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
              {feedback.message}
            </pre>
          </section>

          {/* Meta info */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">詳細情報</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="w-32 shrink-0 font-medium text-slate-500">ユーザー ID</dt>
                <dd className="break-all font-mono text-slate-800">{feedback.user_id}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="w-32 shrink-0 font-medium text-slate-500">カテゴリ</dt>
                <dd>
                  <CategoryBadge category={feedback.category} />
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="w-32 shrink-0 font-medium text-slate-500">作成日時</dt>
                <dd className="text-slate-800">{formatJst(feedback.created_at)}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="w-32 shrink-0 font-medium text-slate-500">更新日時</dt>
                <dd className="text-slate-800">{formatJst(feedback.updated_at)}</dd>
              </div>
              {feedback.page_url && (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                  <dt className="w-32 shrink-0 font-medium text-slate-500">ページ URL</dt>
                  <dd className="break-all text-slate-800">{feedback.page_url}</dd>
                </div>
              )}
              {feedback.user_agent && (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                  <dt className="w-32 shrink-0 font-medium text-slate-500">User Agent</dt>
                  <dd className="break-all text-xs text-slate-600">{feedback.user_agent}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        {/* Right column: status + admin note */}
        <div className="space-y-6">
          {/* Status */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">ステータス</h2>

            {statusError && (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <p>{statusError}</p>
              </div>
            )}

            <div className="relative">
              <select
                value={feedback.status}
                onChange={(e) => void handleStatusChange(e)}
                disabled={isUpdatingStatus || !user}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm text-slate-800 shadow-sm transition focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="ステータスを変更"
              >
                {(['new', 'in_progress', 'resolved', 'archived'] as FeedbackStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {FEEDBACK_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              {isUpdatingStatus && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden="true" />
                </span>
              )}
            </div>

            {isUpdatingStatus && (
              <p className="mt-2 text-xs text-slate-500">更新中...</p>
            )}
          </section>

          {/* Admin note */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">管理者メモ</h2>

            {noteError && (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <p>{noteError}</p>
              </div>
            )}

            {noteSaveSuccess && (
              <p className="mb-3 text-xs text-emerald-600">メモを保存しました</p>
            )}

            <textarea
              rows={5}
              value={noteText}
              onChange={(e) => {
                setNoteText(e.target.value)
                setNoteSaveSuccess(false)
              }}
              maxLength={MAX_ADMIN_NOTE_LENGTH}
              placeholder="管理者メモを入力..."
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
              aria-label="管理者メモ"
            />

            <div className="mt-1.5 flex items-center justify-between">
              <p
                className={`text-xs ${isNoteOverLimit ? 'text-red-600' : 'text-slate-400'}`}
                aria-live="polite"
              >
                {noteText.length} / {MAX_ADMIN_NOTE_LENGTH}
              </p>

              <button
                type="button"
                onClick={() => void handleNoteSave()}
                disabled={isNoteUnchanged || isSavingNote || isNoteOverLimit || !user}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="管理者メモを保存"
              >
                {isSavingNote ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {isSavingNote ? '保存中...' : '保存'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}
