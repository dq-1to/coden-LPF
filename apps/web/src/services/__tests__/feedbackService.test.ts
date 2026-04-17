import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  getFeedback,
  listFeedback,
  submitFeedback,
  updateFeedbackNote,
  updateFeedbackStatus,
} from '../feedbackService'

// Supabase chain mocks. 単一テーブルごとにビルダーを返す `from` を作成する。

type Row = Record<string, unknown>

const userFeedbackState = {
  insertPayload: null as Row | null,
  insertResult: { data: null as Row | null, error: null as unknown },
  updatePayload: null as Row | null,
  updateResult: { data: null as Row | null, error: null as unknown },
  selectCalled: false,
  lastEq: null as [string, unknown] | null,
  orderCalls: [] as Array<{ column: string; options: Record<string, unknown> | undefined }>,
  filterEqCalls: [] as Array<[string, unknown]>,
  listResult: { data: null as Row[] | null, error: null as unknown },
  maybeSingleResult: { data: null as Row | null, error: null as unknown },
  limitCalls: [] as number[],
}

const auditLogState = {
  lastInsertPayload: null as Row | null,
  insertResult: { error: null as unknown },
}

function createUserFeedbackBuilder() {
  const builder: Record<string, unknown> = {}

  const insertResolve = () => ({
    select: () => ({
      single: () => Promise.resolve(userFeedbackState.insertResult),
    }),
  })

  const updateResolve = () => ({
    eq: () => ({
      select: () => ({
        single: () => Promise.resolve(userFeedbackState.updateResult),
      }),
    }),
  })

  builder.insert = (payload: Row) => {
    userFeedbackState.insertPayload = payload
    return insertResolve()
  }

  builder.update = (payload: Row) => {
    userFeedbackState.updatePayload = payload
    return updateResolve()
  }

  // select/.order/.eq/.limit chains. Both maybeSingle (detail) and array-style (list).
  builder.select = () => {
    userFeedbackState.selectCalled = true
    const chain = {
      eq(col: string, val: unknown) {
        userFeedbackState.lastEq = [col, val]
        return {
          maybeSingle: () => Promise.resolve(userFeedbackState.maybeSingleResult),
        }
      },
      order(col: string, options?: Record<string, unknown>) {
        userFeedbackState.orderCalls.push({ column: col, options })
        return filterChain()
      },
    }
    return chain
  }

  function filterChain() {
    const chain = {
      eq(col: string, val: unknown) {
        userFeedbackState.filterEqCalls.push([col, val])
        return chain
      },
      limit(n: number) {
        userFeedbackState.limitCalls.push(n)
        return chain
      },
      then(resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) {
        return Promise.resolve(userFeedbackState.listResult).then(resolve, reject)
      },
    }
    return chain
  }

  return builder
}

function createAuditLogBuilder() {
  return {
    insert: (payload: Row) => {
      auditLogState.lastInsertPayload = payload
      return Promise.resolve(auditLogState.insertResult)
    },
  }
}

const from = vi.fn((table: string) => {
  if (table === 'user_feedback') return createUserFeedbackBuilder()
  if (table === 'admin_audit_log') return createAuditLogBuilder()
  throw new Error(`unexpected table: ${table}`)
})

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => from(...(args as [string])),
  },
}))

const VALID_USER_ID = '11111111-1111-1111-1111-111111111111'
const VALID_ADMIN_ID = '22222222-2222-2222-2222-222222222222'
const VALID_FEEDBACK_ID = '33333333-3333-3333-3333-333333333333'

function resetState() {
  vi.clearAllMocks()
  userFeedbackState.insertPayload = null
  userFeedbackState.insertResult = { data: null, error: null }
  userFeedbackState.updatePayload = null
  userFeedbackState.updateResult = { data: null, error: null }
  userFeedbackState.selectCalled = false
  userFeedbackState.lastEq = null
  userFeedbackState.orderCalls = []
  userFeedbackState.filterEqCalls = []
  userFeedbackState.listResult = { data: null, error: null }
  userFeedbackState.maybeSingleResult = { data: null, error: null }
  userFeedbackState.limitCalls = []
  auditLogState.lastInsertPayload = null
  auditLogState.insertResult = { error: null }
}

describe('FEEDBACK_CATEGORIES / FEEDBACK_STATUSES', () => {
  it('4種類のカテゴリを保持する', () => {
    expect(FEEDBACK_CATEGORIES.size).toBe(4)
    expect(FEEDBACK_CATEGORIES.has('bug')).toBe(true)
    expect(FEEDBACK_CATEGORIES.has('review')).toBe(true)
    expect(FEEDBACK_CATEGORIES.has('request')).toBe(true)
    expect(FEEDBACK_CATEGORIES.has('other')).toBe(true)
  })

  it('4種類のステータスを保持する', () => {
    expect(FEEDBACK_STATUSES.size).toBe(4)
    expect(FEEDBACK_STATUSES.has('new')).toBe(true)
    expect(FEEDBACK_STATUSES.has('in_progress')).toBe(true)
    expect(FEEDBACK_STATUSES.has('resolved')).toBe(true)
    expect(FEEDBACK_STATUSES.has('archived')).toBe(true)
  })
})

describe('submitFeedback', () => {
  beforeEach(resetState)

  it('user_feedback テーブルに INSERT して作成レコードを返す', async () => {
    userFeedbackState.insertResult = {
      data: {
        id: VALID_FEEDBACK_ID,
        user_id: VALID_USER_ID,
        category: 'bug',
        message: 'hello',
        page_url: '/step/abc',
        user_agent: 'UA',
        status: 'new',
        admin_note: null,
        created_at: '2026-04-17T00:00:00Z',
        updated_at: '2026-04-17T00:00:00Z',
      },
      error: null,
    }

    const result = await submitFeedback({
      userId: VALID_USER_ID,
      category: 'bug',
      message: '  hello  ',
      pageUrl: '/step/abc',
      userAgent: 'UA',
    })

    expect(from).toHaveBeenCalledWith('user_feedback')
    expect(userFeedbackState.insertPayload).toEqual({
      user_id: VALID_USER_ID,
      category: 'bug',
      message: 'hello',
      page_url: '/step/abc',
      user_agent: 'UA',
    })
    expect(result.id).toBe(VALID_FEEDBACK_ID)
  })

  it('空文字列の本文は例外を投げ INSERT を呼ばない', async () => {
    await expect(
      submitFeedback({ userId: VALID_USER_ID, category: 'bug', message: '   ' }),
    ).rejects.toThrow('message must not be empty')
    expect(userFeedbackState.insertPayload).toBeNull()
  })

  it('不正なカテゴリは例外を投げる', async () => {
    await expect(
      // @ts-expect-error - テスト用に不正な値を意図的に渡している
      submitFeedback({ userId: VALID_USER_ID, category: 'hack', message: 'x' }),
    ).rejects.toThrow('category is not a valid value')
  })

  it('4000文字を超える本文は例外を投げる', async () => {
    await expect(
      submitFeedback({ userId: VALID_USER_ID, category: 'other', message: 'a'.repeat(4001) }),
    ).rejects.toThrow('message must be at most 4000 characters')
  })

  it('不正な userId は例外を投げる', async () => {
    await expect(
      submitFeedback({ userId: 'not-a-uuid', category: 'bug', message: 'hi' }),
    ).rejects.toThrow('userId must be a valid UUID')
  })

  it('pageUrl が 500 文字超過時は 500 文字に丸める', async () => {
    userFeedbackState.insertResult = { data: {}, error: null }
    await submitFeedback({
      userId: VALID_USER_ID,
      category: 'bug',
      message: 'x',
      pageUrl: 'a'.repeat(600),
    })
    expect(userFeedbackState.insertPayload?.page_url).toHaveLength(500)
  })

  it('Supabase エラーをアプリ共通エラーに変換する', async () => {
    userFeedbackState.insertResult = {
      data: null,
      error: { code: 'DB_ERROR', message: 'permission denied' },
    }
    await expect(
      submitFeedback({ userId: VALID_USER_ID, category: 'bug', message: 'x' }),
    ).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'フィードバックの送信に失敗しました',
    })
  })
})

describe('listFeedback', () => {
  beforeEach(resetState)

  it('created_at 降順で取得する', async () => {
    userFeedbackState.listResult = { data: [], error: null }
    await listFeedback()
    expect(userFeedbackState.orderCalls).toEqual([
      { column: 'created_at', options: { ascending: false } },
    ])
    expect(userFeedbackState.filterEqCalls).toEqual([])
  })

  it('category / status フィルタを eq として適用する', async () => {
    userFeedbackState.listResult = { data: [], error: null }
    await listFeedback({ category: 'bug', status: 'new' })
    expect(userFeedbackState.filterEqCalls).toEqual([
      ['category', 'bug'],
      ['status', 'new'],
    ])
  })

  it('limit を 500 上限でクランプする', async () => {
    userFeedbackState.listResult = { data: [], error: null }
    await listFeedback({ limit: 9999 })
    expect(userFeedbackState.limitCalls).toEqual([500])
  })

  it('不正なカテゴリは例外を投げる', async () => {
    await expect(
      // @ts-expect-error - テスト用に不正な値を意図的に渡している
      listFeedback({ category: 'hack' }),
    ).rejects.toThrow('category is not a valid value')
  })

  it('Supabase エラーをアプリ共通エラーに変換する', async () => {
    userFeedbackState.listResult = {
      data: null,
      error: { code: 'DB_ERROR', message: 'rls violation' },
    }
    await expect(listFeedback()).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'フィードバック一覧の取得に失敗しました',
    })
  })
})

describe('getFeedback', () => {
  beforeEach(resetState)

  it('id で user_feedback を取得する', async () => {
    userFeedbackState.maybeSingleResult = {
      data: { id: VALID_FEEDBACK_ID },
      error: null,
    }
    const result = await getFeedback(VALID_FEEDBACK_ID)
    expect(userFeedbackState.lastEq).toEqual(['id', VALID_FEEDBACK_ID])
    expect(result).toEqual({ id: VALID_FEEDBACK_ID })
  })

  it('該当なしのときは null を返す', async () => {
    userFeedbackState.maybeSingleResult = { data: null, error: null }
    expect(await getFeedback(VALID_FEEDBACK_ID)).toBeNull()
  })

  it('不正な id は例外を投げる', async () => {
    await expect(getFeedback('xxx')).rejects.toThrow('id must be a valid UUID')
  })
})

describe('updateFeedbackStatus', () => {
  beforeEach(resetState)

  it('user_feedback UPDATE と admin_audit_log INSERT を行う', async () => {
    userFeedbackState.updateResult = {
      data: { id: VALID_FEEDBACK_ID, status: 'resolved' },
      error: null,
    }
    const result = await updateFeedbackStatus(VALID_FEEDBACK_ID, 'resolved', VALID_ADMIN_ID)

    expect(userFeedbackState.updatePayload).toEqual({ status: 'resolved' })
    expect(auditLogState.lastInsertPayload).toEqual({
      admin_id: VALID_ADMIN_ID,
      action: 'feedback.status_updated',
      target_type: 'user_feedback',
      target_id: VALID_FEEDBACK_ID,
      payload: { status: 'resolved' },
    })
    expect(result.status).toBe('resolved')
  })

  it('UPDATE が失敗したら audit_log INSERT しない', async () => {
    userFeedbackState.updateResult = {
      data: null,
      error: { code: 'DB_ERROR', message: 'rls denied' },
    }

    await expect(
      updateFeedbackStatus(VALID_FEEDBACK_ID, 'resolved', VALID_ADMIN_ID),
    ).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'フィードバックのステータス更新に失敗しました',
    })

    expect(auditLogState.lastInsertPayload).toBeNull()
  })

  it('audit_log INSERT 失敗は例外を握り潰さず投げる', async () => {
    userFeedbackState.updateResult = {
      data: { id: VALID_FEEDBACK_ID, status: 'resolved' },
      error: null,
    }
    auditLogState.insertResult = { error: { code: 'DB_ERROR', message: 'log failed' } }

    await expect(
      updateFeedbackStatus(VALID_FEEDBACK_ID, 'resolved', VALID_ADMIN_ID),
    ).rejects.toMatchObject({
      name: 'AppError',
      userMessage: '監査ログの記録に失敗しました',
    })
  })

  it('不正なステータスは例外を投げる', async () => {
    await expect(
      // @ts-expect-error - テスト用に不正な値を意図的に渡している
      updateFeedbackStatus(VALID_FEEDBACK_ID, 'done', VALID_ADMIN_ID),
    ).rejects.toThrow('status is not a valid value')
  })

  it('不正な adminId は例外を投げる', async () => {
    await expect(
      updateFeedbackStatus(VALID_FEEDBACK_ID, 'resolved', 'not-uuid'),
    ).rejects.toThrow('adminId must be a valid UUID')
  })
})

describe('updateFeedbackNote', () => {
  beforeEach(resetState)

  it('admin_note を UPDATE し audit_log に長さを記録する', async () => {
    userFeedbackState.updateResult = {
      data: { id: VALID_FEEDBACK_ID, admin_note: 'hi' },
      error: null,
    }
    const result = await updateFeedbackNote(VALID_FEEDBACK_ID, '  hi  ', VALID_ADMIN_ID)

    expect(userFeedbackState.updatePayload).toEqual({ admin_note: 'hi' })
    expect(auditLogState.lastInsertPayload).toEqual({
      admin_id: VALID_ADMIN_ID,
      action: 'feedback.note_updated',
      target_type: 'user_feedback',
      target_id: VALID_FEEDBACK_ID,
      payload: { note_length: 2 },
    })
    expect(result.admin_note).toBe('hi')
  })

  it('空文字列は null として保存する', async () => {
    userFeedbackState.updateResult = { data: { id: VALID_FEEDBACK_ID, admin_note: null }, error: null }
    await updateFeedbackNote(VALID_FEEDBACK_ID, '   ', VALID_ADMIN_ID)
    expect(userFeedbackState.updatePayload).toEqual({ admin_note: null })
    expect(auditLogState.lastInsertPayload?.payload).toEqual({ note_length: 0 })
  })

  it('null は null として保存する', async () => {
    userFeedbackState.updateResult = { data: { id: VALID_FEEDBACK_ID, admin_note: null }, error: null }
    await updateFeedbackNote(VALID_FEEDBACK_ID, null, VALID_ADMIN_ID)
    expect(userFeedbackState.updatePayload).toEqual({ admin_note: null })
  })

  it('2000文字超過時は 2000 文字に丸める', async () => {
    userFeedbackState.updateResult = { data: {}, error: null }
    await updateFeedbackNote(VALID_FEEDBACK_ID, 'a'.repeat(2500), VALID_ADMIN_ID)
    expect((userFeedbackState.updatePayload?.admin_note as string).length).toBe(2000)
  })

  it('UPDATE 失敗は例外を投げ audit_log を呼ばない', async () => {
    userFeedbackState.updateResult = {
      data: null,
      error: { code: 'DB_ERROR', message: 'rls denied' },
    }
    await expect(
      updateFeedbackNote(VALID_FEEDBACK_ID, 'hi', VALID_ADMIN_ID),
    ).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'フィードバックのメモ更新に失敗しました',
    })
    expect(auditLogState.lastInsertPayload).toBeNull()
  })
})
