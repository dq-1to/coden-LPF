import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getProfile, upsertDisplayName } from '../profileService'

const maybeSingle = vi.fn()
const eq = vi.fn()
const select = vi.fn()
const upsert = vi.fn()
const from = vi.fn()

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => from(...args),
  },
}))

describe('getProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    from.mockReturnValue({ select })
    select.mockReturnValue({ eq })
    eq.mockReturnValue({ maybeSingle })
  })

  it('profiles テーブルから指定ユーザーのプロフィールを取得する', async () => {
    const profile = {
      id: 'user-1',
      display_name: 'Coden User',
      created_at: '2026-01-01T00:00:00.000Z',
    }
    maybeSingle.mockResolvedValue({ data: profile, error: null })

    const result = await getProfile('user-1')

    expect(from).toHaveBeenCalledWith('profiles')
    expect(select).toHaveBeenCalledWith('id, display_name, created_at')
    expect(eq).toHaveBeenCalledWith('id', 'user-1')
    expect(result).toEqual(profile)
  })

  it('プロフィールが存在しない場合は null を返す', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null })

    const result = await getProfile('unknown-user')

    expect(result).toBeNull()
  })

  it('Supabase エラーをアプリ共通エラーに変換する', async () => {
    maybeSingle.mockResolvedValue({
      data: null,
      error: { code: 'DB_ERROR', message: 'connection error' },
    })

    await expect(getProfile('user-1')).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'プロフィールの取得に失敗しました',
    })
  })
})

describe('upsertDisplayName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    from.mockReturnValue({ upsert })
  })

  it('displayName を profiles テーブルに upsert する', async () => {
    upsert.mockResolvedValue({ error: null })

    await upsertDisplayName('user-1', 'New Name')

    expect(from).toHaveBeenCalledWith('profiles')
    expect(upsert).toHaveBeenCalledWith(
      { id: 'user-1', display_name: 'New Name' },
      { onConflict: 'id', ignoreDuplicates: false },
    )
  })

  it('前後の空白をトリムした値を保存する', async () => {
    upsert.mockResolvedValue({ error: null })

    await upsertDisplayName('user-1', '  Trimmed  ')

    expect(upsert).toHaveBeenCalledWith(
      { id: 'user-1', display_name: 'Trimmed' },
      { onConflict: 'id', ignoreDuplicates: false },
    )
  })

  it('空白のみの displayName は null として保存する', async () => {
    upsert.mockResolvedValue({ error: null })

    await upsertDisplayName('user-1', '   ')

    expect(upsert).toHaveBeenCalledWith(
      { id: 'user-1', display_name: null },
      { onConflict: 'id', ignoreDuplicates: false },
    )
  })

  it('null の displayName は null として保存する', async () => {
    upsert.mockResolvedValue({ error: null })

    await upsertDisplayName('user-1', null)

    expect(upsert).toHaveBeenCalledWith(
      { id: 'user-1', display_name: null },
      { onConflict: 'id', ignoreDuplicates: false },
    )
  })

  it('50文字を超える displayName は例外を投げる', async () => {
    await expect(upsertDisplayName('user-1', 'a'.repeat(51))).rejects.toThrow(
      'displayName must be at most 50 characters',
    )
    expect(upsert).not.toHaveBeenCalled()
  })

  it('50文字ちょうどの displayName は upsert を呼び出す', async () => {
    upsert.mockResolvedValue({ error: null })

    await expect(upsertDisplayName('user-1', 'a'.repeat(50))).resolves.toBeUndefined()
    expect(upsert).toHaveBeenCalled()
  })

  it('Supabase エラーをアプリ共通エラーに変換する', async () => {
    upsert.mockResolvedValue({
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    })

    await expect(upsertDisplayName('user-1', 'Name')).rejects.toMatchObject({
      name: 'AppError',
      userMessage: 'プロフィールの更新に失敗しました',
    })
  })
})
