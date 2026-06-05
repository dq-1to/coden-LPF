import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import { assertMaxLength, assertOneOf, assertUuid } from '../shared/validation'
import {
  MAX_NOTIFICATION_BODY_LENGTH,
  MAX_NOTIFICATION_TITLE_LENGTH,
  NOTIFICATION_TARGET_ROLES,
  type Notification,
  type NotificationTargetRole,
  type NotificationType,
} from './notificationService'

export interface CreateAnnouncementInput {
  adminId: string
  title: string
  body: string
  targetRole: NotificationTargetRole
}

export interface CreateFeedbackNotificationInput {
  adminId: string
  feedbackId: string
}

function normalizeRequiredText(value: string, maxLength: number, name: string): string {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    throw new Error(`${name} must not be empty`)
  }
  assertMaxLength(trimmed, maxLength, name)
  return trimmed
}

async function insertNotification(input: {
  adminId: string
  type: NotificationType
  title: string
  body: string
  targetRole: NotificationTargetRole
}): Promise<Notification> {
  assertUuid(input.adminId, 'adminId')
  assertOneOf(input.targetRole, NOTIFICATION_TARGET_ROLES, 'targetRole')

  const title = normalizeRequiredText(input.title, MAX_NOTIFICATION_TITLE_LENGTH, 'title')
  const body = normalizeRequiredText(input.body, MAX_NOTIFICATION_BODY_LENGTH, 'body')

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      type: input.type,
      title,
      body,
      target_role: input.targetRole,
      created_by: input.adminId,
    })
    .select()
    .single()

  if (error) {
    throw fromSupabaseError(error, 'お知らせの作成に失敗しました')
  }

  return data
}

/** 管理者が即時お知らせを作成する。予定送信は M1/MVP 対象外。 */
export async function createAnnouncement(input: CreateAnnouncementInput): Promise<Notification> {
  return insertNotification({
    adminId: input.adminId,
    type: 'announcement',
    title: input.title,
    body: input.body,
    targetRole: input.targetRole,
  })
}

/** 管理者向けのフィードバック到着通知を作成する。実際の投稿時連携は M3 で行う。 */
export async function createFeedbackNotification(
  input: CreateFeedbackNotificationInput,
): Promise<Notification> {
  assertUuid(input.feedbackId, 'feedbackId')

  return insertNotification({
    adminId: input.adminId,
    type: 'feedback',
    title: '新しいフィードバックが届きました',
    body: `フィードバック ${input.feedbackId} が届きました。管理画面で詳細を確認してください。`,
    targetRole: 'admin',
  })
}
