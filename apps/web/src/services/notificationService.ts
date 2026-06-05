import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import { assertPositiveInteger, assertUuid } from '../shared/validation'
import type { Tables } from '../shared/types/database.types'

export type Notification = Tables<'notifications'>
export type NotificationRead = Tables<'notification_reads'>

export type NotificationType = 'announcement' | 'release' | 'event' | 'feedback' | 'system'
export type NotificationTargetRole = 'all' | 'learner' | 'admin'

export const NOTIFICATION_TYPES: ReadonlySet<string> = new Set([
  'announcement',
  'release',
  'event',
  'feedback',
  'system',
])

export const NOTIFICATION_TARGET_ROLES: ReadonlySet<string> = new Set([
  'all',
  'learner',
  'admin',
])

export const MAX_NOTIFICATION_TITLE_LENGTH = 120
export const MAX_NOTIFICATION_BODY_LENGTH = 4000
export const MAX_NOTIFICATION_LIST_LIMIT = 100
export const NOTIFICATIONS_UPDATED_EVENT = 'coden:notifications-updated'

export interface NotificationWithRead extends Notification {
  readAt: string | null
  isRead: boolean
}

export interface GetNotificationsInput {
  userId: string
  limit?: number
}

function isBrowserEnvironment() {
  return typeof window !== 'undefined'
}

function notifyNotificationsUpdated() {
  if (!isBrowserEnvironment()) {
    return
  }

  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT))
}

/** 自分に届く通知一覧を取得し、既読状態を合成する。 */
export async function getNotifications(
  input: GetNotificationsInput,
): Promise<NotificationWithRead[]> {
  assertUuid(input.userId, 'userId')

  let notificationQuery = supabase
    .from('notifications')
    .select('*')
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (input.limit !== undefined) {
    assertPositiveInteger(input.limit, 'limit')
    notificationQuery = notificationQuery.limit(Math.min(input.limit, MAX_NOTIFICATION_LIST_LIMIT))
  }

  const { data: notifications, error } = await notificationQuery
  if (error) {
    throw fromSupabaseError(error, 'お知らせ一覧の取得に失敗しました')
  }

  const rows = notifications ?? []
  if (rows.length === 0) {
    return []
  }

  const notificationIds = rows.map((notification) => notification.id)
  const { data: reads, error: readsError } = await supabase
    .from('notification_reads')
    .select('notification_id, read_at')
    .eq('user_id', input.userId)
    .in('notification_id', notificationIds)

  if (readsError) {
    throw fromSupabaseError(readsError, 'お知らせの既読状態の取得に失敗しました')
  }

  const readAtByNotificationId = new Map(
    (reads ?? []).map((read) => [read.notification_id, read.read_at]),
  )

  return rows.map((notification) => {
    const readAt = readAtByNotificationId.get(notification.id) ?? null
    return {
      ...notification,
      readAt,
      isRead: readAt !== null,
    }
  })
}

/** 自分宛て通知の未読件数を取得する。 */
export async function getUnreadCount(userId: string): Promise<number> {
  const notifications = await getNotifications({ userId })
  return notifications.filter((notification) => !notification.isRead).length
}

/** 通知を既読にする。既に既読の場合も成功扱いにする。 */
export async function markAsRead(notificationId: string, userId: string): Promise<void> {
  assertUuid(notificationId, 'notificationId')
  assertUuid(userId, 'userId')

  const { error } = await supabase
    .from('notification_reads')
    .upsert(
      {
        notification_id: notificationId,
        user_id: userId,
      },
      { onConflict: 'notification_id,user_id' },
    )

  if (error) {
    throw fromSupabaseError(error, 'お知らせを確認済みにできませんでした')
  }

  notifyNotificationsUpdated()
}

export function subscribeNotificationsUpdated(onChange: () => void): () => void {
  if (!isBrowserEnvironment()) {
    return () => {}
  }

  window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, onChange)
  return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, onChange)
}
