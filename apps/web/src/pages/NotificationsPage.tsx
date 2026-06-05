import { useCallback, useEffect, useState } from 'react'
import { Check, Mailbox } from 'lucide-react'
import { AppHeader } from '../features/dashboard/components/AppHeader'
import { ConfigErrorView } from '../components/ConfigErrorView'
import { ErrorBanner } from '../components/ErrorBanner'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useGreetingName } from '../hooks/useGreetingName'
import { useSignOut } from '../hooks/useSignOut'
import { supabaseConfigError } from '../lib/supabaseClient'
import {
  getNotifications,
  markAsRead,
  type NotificationType,
  type NotificationWithRead,
} from '../services/notificationService'
import { formatDateTime } from '../shared/utils/dateTime'

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  announcement: 'お知らせ',
  release: 'リリース',
  event: 'イベント',
  feedback: 'フィードバック',
  system: 'システム',
}

function getTypeLabel(type: string): string {
  return NOTIFICATION_TYPE_LABELS[type as NotificationType] ?? 'お知らせ'
}

export function NotificationsPage() {
  useDocumentTitle('ポスト')
  const { user } = useAuth()
  const userId = user?.id ?? null
  const { greetingName } = useGreetingName()
  const [notifications, setNotifications] = useState<NotificationWithRead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const onSignOutError = useCallback((msg: string) => setError(msg), [])
  const handleSignOut = useSignOut(onSignOutError)

  const loadNotifications = useCallback(async () => {
    if (!userId || supabaseConfigError) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const rows = await getNotifications({ userId })
      setNotifications(rows)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'お知らせ一覧の取得に失敗しました'
      setError(message)
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  async function handleMarkAsRead(notificationId: string) {
    if (!userId) {
      return
    }

    setMarkingId(notificationId)
    setError(null)
    try {
      await markAsRead(notificationId, userId)
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true, readAt: notification.readAt ?? new Date().toISOString() }
            : notification,
        ),
      )
    } catch (markError) {
      const message = markError instanceof Error ? markError.message : 'お知らせを確認済みにできませんでした'
      setError(message)
    } finally {
      setMarkingId(null)
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary-bg/40 to-sky-50/50">
      <AppHeader displayName={greetingName} onSignOut={() => void handleSignOut()} />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {supabaseConfigError ? <ConfigErrorView message={supabaseConfigError} /> : null}
        {error ? <ErrorBanner className="mb-4">{error}</ErrorBanner> : null}

        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary-dark">
              <Mailbox className="h-5 w-5" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-wide">Post</p>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">ポスト</h1>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            新着 {unreadCount} 件
          </div>
        </header>

        <section className="space-y-3" aria-label="お知らせ一覧">
          {isLoading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <Spinner label="お知らせを読み込み中..." />
            </div>
          ) : null}

          {!isLoading && notifications.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <Mailbox className="mx-auto h-9 w-9 text-slate-400" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                まだ届いているお知らせはありません
              </p>
            </div>
          ) : null}

          {!isLoading && notifications.map((notification) => {
            const isMarking = markingId === notification.id
            return (
              <article
                key={notification.id}
                className={`rounded-lg border bg-white p-5 shadow-sm ${
                  notification.isRead ? 'border-slate-200' : 'border-primary-mint/50'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-secondary-bg px-2 py-0.5 text-xs font-bold text-primary-dark">
                        {getTypeLabel(notification.type)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          notification.isRead
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {notification.isRead ? '確認済み' : '新着'}
                      </span>
                      <time className="text-xs text-slate-500" dateTime={notification.published_at}>
                        {formatDateTime(notification.published_at)}
                      </time>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{notification.title}</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {notification.body}
                    </p>
                  </div>

                  {!notification.isRead ? (
                    <button
                      type="button"
                      onClick={() => void handleMarkAsRead(notification.id)}
                      disabled={isMarking}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-primary-mint bg-white px-3 py-2 text-sm font-semibold text-primary-dark transition hover:bg-secondary-bg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                      {isMarking ? '処理中...' : '確認済みにする'}
                    </button>
                  ) : null}
                </div>
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}
