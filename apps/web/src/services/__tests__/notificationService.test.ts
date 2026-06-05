import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MAX_NOTIFICATION_LIST_LIMIT,
  getNotifications,
  getUnreadCount,
  markAsRead,
} from '../notificationService'

type Row = Record<string, unknown>

const notificationsState = {
  orderCalls: [] as Array<{ column: string; options: Record<string, unknown> | undefined }>,
  limitCalls: [] as number[],
  result: { data: [] as Row[] | null, error: null as unknown },
}

const readsState = {
  selectColumns: null as string | null,
  eqCalls: [] as Array<[string, unknown]>,
  inCalls: [] as Array<[string, unknown[]]>,
  result: { data: [] as Row[] | null, error: null as unknown },
  upsertPayload: null as Row | null,
  upsertOptions: null as Record<string, unknown> | null,
  upsertResult: { error: null as unknown },
}

function createNotificationsBuilder() {
  const chain = {
    order(column: string, options?: Record<string, unknown>) {
      notificationsState.orderCalls.push({ column, options })
      return chain
    },
    limit(limit: number) {
      notificationsState.limitCalls.push(limit)
      return chain
    },
    then(resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) {
      return Promise.resolve(notificationsState.result).then(resolve, reject)
    },
  }

  return {
    select: () => chain,
  }
}

function createReadsBuilder() {
  const chain = {
    eq(column: string, value: unknown) {
      readsState.eqCalls.push([column, value])
      return chain
    },
    in(column: string, values: unknown[]) {
      readsState.inCalls.push([column, values])
      return Promise.resolve(readsState.result)
    },
  }

  return {
    select: (columns: string) => {
      readsState.selectColumns = columns
      return chain
    },
    upsert: (payload: Row, options?: Record<string, unknown>) => {
      readsState.upsertPayload = payload
      readsState.upsertOptions = options ?? null
      return Promise.resolve(readsState.upsertResult)
    },
  }
}

const from = vi.fn((table: string) => {
  if (table === 'notifications') return createNotificationsBuilder()
  if (table === 'notification_reads') return createReadsBuilder()
  throw new Error(`unexpected table: ${table}`)
})

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => from(...(args as [string])),
  },
}))

const USER_ID = '11111111-1111-1111-1111-111111111111'
const NOTIFICATION_ID_1 = '22222222-2222-2222-2222-222222222222'
const NOTIFICATION_ID_2 = '33333333-3333-3333-3333-333333333333'

function resetState() {
  vi.clearAllMocks()
  notificationsState.orderCalls = []
  notificationsState.limitCalls = []
  notificationsState.result = { data: [], error: null }
  readsState.selectColumns = null
  readsState.eqCalls = []
  readsState.inCalls = []
  readsState.result = { data: [], error: null }
  readsState.upsertPayload = null
  readsState.upsertOptions = null
  readsState.upsertResult = { error: null }
}

function notificationRow(id: string, title: string): Row {
  return {
    id,
    type: 'announcement',
    title,
    body: `${title} body`,
    target_role: 'all',
    created_by: null,
    published_at: '2026-06-05T00:00:00Z',
    created_at: '2026-06-05T00:00:00Z',
  }
}

describe('getNotifications', () => {
  beforeEach(resetState)

  it('通知一覧に自分の既読状態を合成する', async () => {
    notificationsState.result = {
      data: [
        notificationRow(NOTIFICATION_ID_1, '読んだ'),
        notificationRow(NOTIFICATION_ID_2, '未読'),
      ],
      error: null,
    }
    readsState.result = {
      data: [{ notification_id: NOTIFICATION_ID_1, read_at: '2026-06-05T01:00:00Z' }],
      error: null,
    }

    const result = await getNotifications({ userId: USER_ID })

    expect(from).toHaveBeenCalledWith('notifications')
    expect(from).toHaveBeenCalledWith('notification_reads')
    expect(notificationsState.orderCalls).toEqual([
      { column: 'published_at', options: { ascending: false } },
      { column: 'created_at', options: { ascending: false } },
    ])
    expect(readsState.eqCalls).toEqual([['user_id', USER_ID]])
    expect(readsState.inCalls).toEqual([
      ['notification_id', [NOTIFICATION_ID_1, NOTIFICATION_ID_2]],
    ])
    expect(result).toMatchObject([
      { id: NOTIFICATION_ID_1, isRead: true, readAt: '2026-06-05T01:00:00Z' },
      { id: NOTIFICATION_ID_2, isRead: false, readAt: null },
    ])
  })

  it('通知がないときは既読状態を問い合わせず空配列を返す', async () => {
    notificationsState.result = { data: [], error: null }
    const result = await getNotifications({ userId: USER_ID })
    expect(result).toEqual([])
    expect(from).toHaveBeenCalledWith('notifications')
    expect(from).not.toHaveBeenCalledWith('notification_reads')
  })

  it('limit は上限でクランプする', async () => {
    await getNotifications({ userId: USER_ID, limit: 999 })
    expect(notificationsState.limitCalls).toEqual([MAX_NOTIFICATION_LIST_LIMIT])
  })

  it('不正な userId は例外を投げる', async () => {
    await expect(getNotifications({ userId: 'not-uuid' })).rejects.toThrow(
      'userId must be a valid UUID',
    )
    expect(from).not.toHaveBeenCalled()
  })

  it('通知一覧の DB エラーを AppError に変換する', async () => {
    notificationsState.result = {
      data: null,
      error: { code: 'DB_ERROR', message: 'rls denied' },
    }
    await expect(getNotifications({ userId: USER_ID })).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'お知らせ一覧の取得に失敗しました',
    })
  })

  it('既読状態の DB エラーを AppError に変換する', async () => {
    notificationsState.result = {
      data: [notificationRow(NOTIFICATION_ID_1, 'title')],
      error: null,
    }
    readsState.result = {
      data: null,
      error: { code: 'DB_ERROR', message: 'rls denied' },
    }
    await expect(getNotifications({ userId: USER_ID })).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'お知らせの既読状態の取得に失敗しました',
    })
  })
})

describe('getUnreadCount', () => {
  beforeEach(resetState)

  it('未読件数を返す', async () => {
    notificationsState.result = {
      data: [
        notificationRow(NOTIFICATION_ID_1, '読んだ'),
        notificationRow(NOTIFICATION_ID_2, '未読'),
      ],
      error: null,
    }
    readsState.result = {
      data: [{ notification_id: NOTIFICATION_ID_1, read_at: '2026-06-05T01:00:00Z' }],
      error: null,
    }

    await expect(getUnreadCount(USER_ID)).resolves.toBe(1)
  })
})

describe('markAsRead', () => {
  beforeEach(resetState)

  it('notification_reads に upsert する', async () => {
    await markAsRead(NOTIFICATION_ID_1, USER_ID)
    expect(from).toHaveBeenCalledWith('notification_reads')
    expect(readsState.upsertPayload).toEqual({
      notification_id: NOTIFICATION_ID_1,
      user_id: USER_ID,
    })
    expect(readsState.upsertOptions).toEqual({ onConflict: 'notification_id,user_id' })
  })

  it('不正な notificationId は例外を投げる', async () => {
    await expect(markAsRead('bad', USER_ID)).rejects.toThrow(
      'notificationId must be a valid UUID',
    )
    expect(from).not.toHaveBeenCalled()
  })

  it('DB エラーを AppError に変換する', async () => {
    readsState.upsertResult = {
      error: { code: 'DB_ERROR', message: 'rls denied' },
    }
    await expect(markAsRead(NOTIFICATION_ID_1, USER_ID)).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'お知らせを確認済みにできませんでした',
    })
  })
})
