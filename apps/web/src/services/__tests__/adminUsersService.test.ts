import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getUserDetail, listUsers } from '../adminUsersService'

const rpc = vi.fn()

// 各テーブル用の最終応答を保持するシンプルなバケット。
// ビルダーは select().eq().(maybeSingle|order.limit|...) のチェーンを受け付けるが、
// どのチェーンでも最終的にこのバケットの応答を返す。
type TableKey =
  | 'profiles'
  | 'learning_stats'
  | 'step_progress'
  | 'challenge_submissions'
  | 'daily_challenge_history'
  | 'achievements'
  | 'code_doctor_progress'
  | 'mini_project_progress'
  | 'code_reading_progress'
  | 'base_nook_progress'
  | 'point_history'

type Bucket = { data: unknown; error: unknown }

const state: Record<TableKey, Bucket> = {
  profiles: { data: null, error: null },
  learning_stats: { data: null, error: null },
  step_progress: { data: [], error: null },
  challenge_submissions: { data: [], error: null },
  daily_challenge_history: { data: [], error: null },
  achievements: { data: [], error: null },
  code_doctor_progress: { data: [], error: null },
  mini_project_progress: { data: [], error: null },
  code_reading_progress: { data: [], error: null },
  base_nook_progress: { data: [], error: null },
  point_history: { data: [], error: null },
}

function createBuilder(key: TableKey) {
  const resolved = () => Promise.resolve(state[key])
  const chain = {
    eq() {
      return chain
    },
    order() {
      return chain
    },
    limit() {
      return chain
    },
    maybeSingle() {
      return resolved()
    },
    then(resolve: (v: unknown) => unknown, reject: (r: unknown) => unknown) {
      return resolved().then(resolve, reject)
    },
  }
  return {
    select: () => chain,
  }
}

const from = vi.fn((table: string) => {
  if (table in state) return createBuilder(table as TableKey)
  throw new Error(`unexpected table: ${table}`)
})

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    rpc: (...args: unknown[]) => rpc(...args),
    from: (...args: unknown[]) => from(...(args as [string])),
  },
}))

const VALID = '11111111-1111-1111-1111-111111111111'

function resetState() {
  vi.clearAllMocks()
  ;(Object.keys(state) as TableKey[]).forEach((k) => {
    const isArray = [
      'step_progress',
      'challenge_submissions',
      'daily_challenge_history',
      'achievements',
      'code_doctor_progress',
      'mini_project_progress',
      'code_reading_progress',
      'base_nook_progress',
      'point_history',
    ].includes(k)
    state[k] = { data: isArray ? [] : null, error: null }
  })
}

describe('listUsers', () => {
  beforeEach(resetState)

  it('admin_list_users RPC を呼び AdminUserSummary[] に変換する', async () => {
    rpc.mockResolvedValue({
      data: [
        {
          user_id: VALID,
          email: 'a@example.com',
          display_name: 'Alice',
          is_admin: true,
          total_points: 500,
          current_streak: 3,
          max_streak: 7,
          last_study_date: '2026-04-10',
          badge_count: 4,
          created_at: '2026-03-01T00:00:00Z',
        },
      ],
      error: null,
    })

    const result = await listUsers()
    expect(rpc).toHaveBeenCalledWith('admin_list_users')
    expect(result).toEqual([
      {
        userId: VALID,
        email: 'a@example.com',
        displayName: 'Alice',
        isAdmin: true,
        totalPoints: 500,
        currentStreak: 3,
        maxStreak: 7,
        lastStudyDate: '2026-04-10',
        badgeCount: 4,
        createdAt: '2026-03-01T00:00:00Z',
      },
    ])
  })

  it('data が null のときは空配列を返す', async () => {
    rpc.mockResolvedValue({ data: null, error: null })
    expect(await listUsers()).toEqual([])
  })

  it('RPC エラーを AppError に変換する', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: 'DB_ERROR', message: 'forbidden' } })
    await expect(listUsers()).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'ユーザー一覧の取得に失敗しました',
    })
  })
})

describe('getUserDetail', () => {
  beforeEach(resetState)

  it('不正な UUID は例外を投げる', async () => {
    await expect(getUserDetail('not-uuid')).rejects.toThrow('userId must be a valid UUID')
  })

  it('profile が 0 件なら null を返す', async () => {
    state.profiles = { data: null, error: null }
    const result = await getUserDetail(VALID)
    expect(result).toBeNull()
  })

  it('全テーブルを取得し AdminUserDetail を組み立てる', async () => {
    state.profiles = {
      data: {
        id: VALID,
        display_name: 'Bob',
        is_admin: false,
        created_at: '2026-03-01T00:00:00Z',
      },
      error: null,
    }
    state.learning_stats = {
      data: {
        total_points: 120,
        current_streak: 2,
        max_streak: 5,
        last_study_date: '2026-04-10',
        updated_at: '2026-04-10T00:00:00Z',
      },
      error: null,
    }
    state.step_progress = { data: [{ id: 's1' }], error: null }
    state.challenge_submissions = { data: [{ id: 'c1' }], error: null }
    state.daily_challenge_history = { data: [{ id: 'd1' }], error: null }
    state.achievements = { data: [{ id: 'a1', badge_id: 'first-step' }], error: null }
    state.code_doctor_progress = { data: [{ id: 'cd1', solved: true }], error: null }
    state.mini_project_progress = { data: [{ id: 'mp1', status: 'completed' }], error: null }
    state.code_reading_progress = { data: [{ id: 'cr1', completed: true }], error: null }
    state.base_nook_progress = { data: [{ id: 'bn1' }], error: null }
    state.point_history = { data: [{ id: 'ph1', amount: 10 }], error: null }

    const result = await getUserDetail(VALID)
    expect(result).not.toBeNull()
    expect(result?.profile).toEqual({
      userId: VALID,
      displayName: 'Bob',
      isAdmin: false,
      createdAt: '2026-03-01T00:00:00Z',
    })
    expect(result?.stats?.totalPoints).toBe(120)
    expect(result?.stepProgress).toHaveLength(1)
    expect(result?.achievements).toHaveLength(1)
    expect(result?.pointHistory).toHaveLength(1)
  })

  it('いずれかのテーブルがエラーなら AppError を投げる', async () => {
    state.profiles = {
      data: { id: VALID, display_name: 'X', is_admin: false, created_at: '2026-03-01T00:00:00Z' },
      error: null,
    }
    state.point_history = { data: null, error: { code: 'DB_ERROR', message: 'x' } }
    await expect(getUserDetail(VALID)).rejects.toMatchObject({
      userMessage: 'ユーザー詳細の取得に失敗しました',
    })
  })

  it('profile エラーは専用メッセージで AppError を投げる', async () => {
    state.profiles = { data: null, error: { code: 'DB_ERROR', message: 'rls denied' } }
    await expect(getUserDetail(VALID)).rejects.toMatchObject({
      userMessage: 'ユーザー情報の取得に失敗しました',
    })
  })
})
