import { beforeEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '../../lib/supabaseClient'
import { insertLearningEvent, trackLearningEvent } from '../eventService'

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const mockFrom = vi.mocked(supabase.from)

describe('eventService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('learning_events に学習イベントを保存する', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValueOnce({ insert } as unknown as ReturnType<typeof supabase.from>)

    await insertLearningEvent({
      userId: '00000000-0000-0000-0000-000000000001',
      eventType: 'mode_started',
      stepId: 'usestate-basic',
      mode: 'read',
      courseId: 'react-fundamentals',
      payload: { order: 1 },
    })

    expect(mockFrom).toHaveBeenCalledWith('learning_events')
    expect(insert).toHaveBeenCalledWith({
      user_id: '00000000-0000-0000-0000-000000000001',
      event_type: 'mode_started',
      step_id: 'usestate-basic',
      mode: 'read',
      course_id: 'react-fundamentals',
      payload: { order: 1 },
    })
  })

  it('Supabase エラーをアプリ共通エラーに変換する', async () => {
    const insert = vi.fn().mockResolvedValue({
      error: { code: '42501', message: 'new row violates row-level security policy' },
    })
    mockFrom.mockReturnValueOnce({ insert } as unknown as ReturnType<typeof supabase.from>)

    await expect(
      insertLearningEvent({
        userId: '00000000-0000-0000-0000-000000000001',
        eventType: 'step_started',
      }),
    ).rejects.toMatchObject({
      name: 'AppError',
      userMessage: '学習イベントの記録に失敗しました',
    })
  })

  it('trackLearningEvent は失敗しても呼び出し元をブロックしない', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const insert = vi.fn().mockResolvedValue({
      error: { code: '42501', message: 'new row violates row-level security policy' },
    })
    mockFrom.mockReturnValueOnce({ insert } as unknown as ReturnType<typeof supabase.from>)

    expect(() => {
      trackLearningEvent({
        userId: '00000000-0000-0000-0000-000000000001',
        eventType: 'step_started',
      })
    }).not.toThrow()

    await vi.waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Learning event tracking failed:', expect.any(Error))
    })

    consoleError.mockRestore()
  })
})
