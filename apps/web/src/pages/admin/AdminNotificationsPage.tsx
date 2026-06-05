import { useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react'
import { AdminLayout } from '../../features/admin/components/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import {
  createAnnouncement,
  type CreateAnnouncementInput,
} from '../../services/adminNotificationService'
import {
  MAX_NOTIFICATION_BODY_LENGTH,
  MAX_NOTIFICATION_TITLE_LENGTH,
  type NotificationTargetRole,
} from '../../services/notificationService'

type Feedback =
  | { kind: 'idle' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }

const TARGET_ROLE_OPTIONS: ReadonlyArray<{
  value: NotificationTargetRole
  label: string
}> = [
  { value: 'all', label: '全ユーザー' },
  { value: 'learner', label: '学習者' },
  { value: 'admin', label: '管理者' },
]

export function AdminNotificationsPage() {
  useDocumentTitle('お知らせ送信 - 管理画面')
  const { user } = useAuth()
  const adminId = user?.id ?? null
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetRole, setTargetRole] = useState<NotificationTargetRole>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>({ kind: 'idle' })

  const trimmedTitle = title.trim()
  const trimmedBody = body.trim()
  const canSubmit =
    Boolean(adminId) &&
    !isSubmitting &&
    trimmedTitle.length > 0 &&
    trimmedTitle.length <= MAX_NOTIFICATION_TITLE_LENGTH &&
    trimmedBody.length > 0 &&
    trimmedBody.length <= MAX_NOTIFICATION_BODY_LENGTH

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit || !adminId) return

    setIsSubmitting(true)
    setFeedback({ kind: 'idle' })
    try {
      const input: CreateAnnouncementInput = {
        adminId,
        title: trimmedTitle,
        body: trimmedBody,
        targetRole,
      }
      await createAnnouncement(input)
      setFeedback({ kind: 'success', message: 'お知らせを送信しました' })
      setTitle('')
      setBody('')
      setTargetRole('all')
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'お知らせの作成に失敗しました',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">お知らせを送る</h1>
        <p className="mt-1 text-sm text-slate-500">
          Coden のポストに届くアプリ内お知らせを即時送信します。
        </p>
      </div>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <FormFeedback feedback={feedback} />

        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="notification-title" className="mb-1 block text-xs font-semibold text-slate-600">
              タイトル
            </label>
            <input
              id="notification-title"
              type="text"
              value={title}
              maxLength={MAX_NOTIFICATION_TITLE_LENGTH}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
              required
            />
            <p className="mt-1 text-xs text-slate-400">
              {trimmedTitle.length} / {MAX_NOTIFICATION_TITLE_LENGTH}
            </p>
          </div>

          <div>
            <label htmlFor="notification-body" className="mb-1 block text-xs font-semibold text-slate-600">
              本文
            </label>
            <textarea
              id="notification-body"
              value={body}
              maxLength={MAX_NOTIFICATION_BODY_LENGTH}
              onChange={(event) => setBody(event.target.value)}
              rows={8}
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-800 shadow-sm focus:border-primary-mint focus:outline-none focus:ring-1 focus:ring-primary-mint"
              required
            />
            <p className="mt-1 text-xs text-slate-400">
              {trimmedBody.length} / {MAX_NOTIFICATION_BODY_LENGTH}
            </p>
          </div>

          <fieldset>
            <legend className="mb-2 block text-xs font-semibold text-slate-600">配信範囲</legend>
            <div className="flex flex-wrap gap-2">
              {TARGET_ROLE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    targetRole === option.value
                      ? 'border-primary-mint bg-secondary-bg text-primary-dark'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="target-role"
                    value={option.value}
                    checked={targetRole === option.value}
                    onChange={() => setTargetRole(option.value)}
                    className="h-4 w-4 accent-primary-mint"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="notification-send-time" className="mb-1 block text-xs font-semibold text-slate-600">
              送信時刻
            </label>
            <input
              id="notification-send-time"
              type="text"
              value="即時送信"
              readOnly
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            {isSubmitting ? '送信中...' : 'お知らせを送る'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}

function FormFeedback({ feedback }: { feedback: Feedback }) {
  if (feedback.kind === 'idle') return null
  if (feedback.kind === 'success') {
    return (
      <div role="status" className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>{feedback.message}</p>
      </div>
    )
  }
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{feedback.message}</p>
    </div>
  )
}
