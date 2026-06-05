import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createAnnouncement,
  createFeedbackNotification,
} from '../adminNotificationService'
import {
  MAX_NOTIFICATION_BODY_LENGTH,
  MAX_NOTIFICATION_TITLE_LENGTH,
} from '../notificationService'

type Row = Record<string, unknown>

const notificationState = {
  insertPayload: null as Row | null,
  insertResult: { data: null as Row | null, error: null as unknown },
}

function createNotificationsBuilder() {
  return {
    insert: (payload: Row) => {
      notificationState.insertPayload = payload
      return {
        select: () => ({
          single: () => Promise.resolve(notificationState.insertResult),
        }),
      }
    },
  }
}

const from = vi.fn((table: string) => {
  if (table === 'notifications') return createNotificationsBuilder()
  throw new Error(`unexpected table: ${table}`)
})

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => from(...(args as [string])),
  },
}))

const ADMIN_ID = '11111111-1111-1111-1111-111111111111'
const FEEDBACK_ID = '22222222-2222-2222-2222-222222222222'
const NOTIFICATION_ID = '33333333-3333-3333-3333-333333333333'

function resetState() {
  vi.clearAllMocks()
  notificationState.insertPayload = null
  notificationState.insertResult = {
    data: {
      id: NOTIFICATION_ID,
      type: 'announcement',
      title: 'title',
      body: 'body',
      target_role: 'all',
      created_by: ADMIN_ID,
      published_at: '2026-06-05T00:00:00Z',
      created_at: '2026-06-05T00:00:00Z',
    },
    error: null,
  }
}

describe('createAnnouncement', () => {
  beforeEach(resetState)

  it('notifications に announcement を INSERT する', async () => {
    const result = await createAnnouncement({
      adminId: ADMIN_ID,
      title: '  リリースのお知らせ  ',
      body: '  新しい機能を公開しました  ',
      targetRole: 'learner',
    })

    expect(from).toHaveBeenCalledWith('notifications')
    expect(notificationState.insertPayload).toEqual({
      type: 'announcement',
      title: 'リリースのお知らせ',
      body: '新しい機能を公開しました',
      target_role: 'learner',
      created_by: ADMIN_ID,
    })
    expect(result.id).toBe(NOTIFICATION_ID)
  })

  it('空の title は INSERT せず例外を投げる', async () => {
    await expect(
      createAnnouncement({
        adminId: ADMIN_ID,
        title: '   ',
        body: 'body',
        targetRole: 'all',
      }),
    ).rejects.toThrow('title must not be empty')
    expect(notificationState.insertPayload).toBeNull()
  })

  it('空の body は INSERT せず例外を投げる', async () => {
    await expect(
      createAnnouncement({
        adminId: ADMIN_ID,
        title: 'title',
        body: '   ',
        targetRole: 'all',
      }),
    ).rejects.toThrow('body must not be empty')
    expect(notificationState.insertPayload).toBeNull()
  })

  it('title / body の最大長を検証する', async () => {
    await expect(
      createAnnouncement({
        adminId: ADMIN_ID,
        title: 'a'.repeat(MAX_NOTIFICATION_TITLE_LENGTH + 1),
        body: 'body',
        targetRole: 'all',
      }),
    ).rejects.toThrow(`title must be at most ${MAX_NOTIFICATION_TITLE_LENGTH} characters`)

    await expect(
      createAnnouncement({
        adminId: ADMIN_ID,
        title: 'title',
        body: 'a'.repeat(MAX_NOTIFICATION_BODY_LENGTH + 1),
        targetRole: 'all',
      }),
    ).rejects.toThrow(`body must be at most ${MAX_NOTIFICATION_BODY_LENGTH} characters`)
    expect(notificationState.insertPayload).toBeNull()
  })

  it('不正な targetRole は例外を投げる', async () => {
    await expect(
      createAnnouncement({
        adminId: ADMIN_ID,
        title: 'title',
        body: 'body',
        // @ts-expect-error - テスト用に不正な値を渡す
        targetRole: 'teacher',
      }),
    ).rejects.toThrow('targetRole is not a valid value')
  })

  it('Supabase エラーを AppError に変換する', async () => {
    notificationState.insertResult = {
      data: null,
      error: { code: 'DB_ERROR', message: 'rls denied' },
    }
    await expect(
      createAnnouncement({
        adminId: ADMIN_ID,
        title: 'title',
        body: 'body',
        targetRole: 'admin',
      }),
    ).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'お知らせの作成に失敗しました',
    })
  })
})

describe('createFeedbackNotification', () => {
  beforeEach(resetState)

  it('admin 宛ての feedback 通知を INSERT する', async () => {
    await createFeedbackNotification({ adminId: ADMIN_ID, feedbackId: FEEDBACK_ID })
    expect(notificationState.insertPayload).toEqual({
      type: 'feedback',
      title: '新しいフィードバックが届きました',
      body: `フィードバック ${FEEDBACK_ID} が届きました。管理画面で詳細を確認してください。`,
      target_role: 'admin',
      created_by: ADMIN_ID,
    })
  })

  it('不正な feedbackId は例外を投げる', async () => {
    await expect(
      createFeedbackNotification({ adminId: ADMIN_ID, feedbackId: 'bad' }),
    ).rejects.toThrow('feedbackId must be a valid UUID')
    expect(notificationState.insertPayload).toBeNull()
  })
})
