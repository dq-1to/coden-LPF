import { cleanup, render, waitFor, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from '../AuthContext'
import { supabase } from '../../lib/supabaseClient'
import type { Session, User } from '@supabase/supabase-js'

// --- Mocks ---

const mockUnsubscribe = vi.fn()

vi.mock('../../lib/supabaseClient', () => {
  const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select }))
  return {
    supabase: {
      auth: {
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      },
      from,
    },
    supabaseConfigError: null,
  }
})

const mockGetSession = vi.mocked(supabase.auth.getSession)
const mockOnAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange)
const mockSignInWithPassword = vi.mocked(supabase.auth.signInWithPassword)
const mockSignUpFn = vi.mocked(supabase.auth.signUp)
const mockSignOutFn = vi.mocked(supabase.auth.signOut)

// --- Test helpers ---

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoadingAuth: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | 'CONFIRM_EMAIL' | null>
  signOut: () => Promise<string | null>
}

function TestConsumer({ onValue }: { onValue: (v: AuthContextValue) => void }) {
  const auth = useAuth()
  onValue(auth)
  return null
}

const fakeUser = { id: 'user-1', email: 'test@example.com' } as User
const fakeSession = { user: fakeUser, access_token: 'token' } as Session

// --- Tests ---

describe('AuthContext', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    mockUnsubscribe.mockReset()

    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as never)

    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    } as never)
  })

  it('getSession からユーザー/セッションを取得して提供する', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: fakeSession },
      error: null,
    } as never)

    let captured: AuthContextValue | undefined

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </AuthProvider>,
      )
    })

    await waitFor(() => {
      expect(captured).toBeDefined()
      expect(captured!.user?.id).toBe('user-1')
      expect(captured!.session).toBe(fakeSession)
      expect(captured!.isLoadingAuth).toBe(false)
    })
  })

  it('signIn が成功時に null を返す', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: fakeUser, session: fakeSession },
      error: null,
    } as never)

    let captured: AuthContextValue | undefined

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </AuthProvider>,
      )
    })

    await waitFor(() => expect(captured!.isLoadingAuth).toBe(false))

    let result: string | null = 'initial'
    await act(async () => {
      result = await captured!.signIn('test@example.com', 'password')
    })

    expect(result).toBeNull()
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    })
  })

  it('signIn が失敗時にエラーメッセージを返す', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    } as never)

    let captured: AuthContextValue | undefined

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </AuthProvider>,
      )
    })

    await waitFor(() => expect(captured!.isLoadingAuth).toBe(false))

    let result: string | null = null
    await act(async () => {
      result = await captured!.signIn('wrong@example.com', 'wrong')
    })

    expect(result).toBe('Invalid credentials')
  })

  it('signUp がメール確認待ちのとき CONFIRM_EMAIL を返す', async () => {
    mockSignUpFn.mockResolvedValue({
      data: { user: fakeUser, session: null },
      error: null,
    } as never)

    let captured: AuthContextValue | undefined

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </AuthProvider>,
      )
    })

    await waitFor(() => expect(captured!.isLoadingAuth).toBe(false))

    let result: string | 'CONFIRM_EMAIL' | null = null
    await act(async () => {
      result = await captured!.signUp('new@example.com', 'password123')
    })

    expect(result).toBe('CONFIRM_EMAIL')
  })

  it('signUp が既に登録済みのメールアドレスでエラーを返す（identities.length === 0）', async () => {
    mockSignUpFn.mockResolvedValue({
      data: {
        user: { ...fakeUser, identities: [] },
        session: null,
      },
      error: null,
    } as never)

    let captured: AuthContextValue | undefined

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </AuthProvider>,
      )
    })

    await waitFor(() => expect(captured!.isLoadingAuth).toBe(false))

    let result: string | null = null
    await act(async () => {
      result = await captured!.signUp('existing@example.com', 'password123')
    })

    expect(result).toBe('このメールアドレスは既に登録されています。')
  })

  it('signOut が成功時に null を返す', async () => {
    mockSignOutFn.mockResolvedValue({
      error: null,
    } as never)

    let captured: AuthContextValue | undefined

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onValue={(v) => { captured = v }} />
        </AuthProvider>,
      )
    })

    await waitFor(() => expect(captured!.isLoadingAuth).toBe(false))

    let result: string | null = 'initial'
    await act(async () => {
      result = await captured!.signOut()
    })

    expect(result).toBeNull()
    expect(mockSignOutFn).toHaveBeenCalled()
  })

  it('useAuth が AuthProvider の外で使用されると例外を投げる', () => {
    expect(() => {
      function Thrower() {
        useAuth()
        return null
      }
      render(<Thrower />)
    }).toThrow('useAuth must be used inside AuthProvider')
  })

  it('アンマウント時にサブスクリプションを解除する', async () => {
    let onAuthCallback: (event: string, session: Session | null) => void = () => {}

    mockOnAuthStateChange.mockImplementation(((cb: (event: string, session: Session | null) => void) => {
      onAuthCallback = cb
      return {
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      }
    }) as never)

    // getSession が解決した後に onAuthStateChange が登録される
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as never)

    let _component: ReturnType<typeof render> | undefined

    await act(async () => {
      _component = render(
        <AuthProvider>
          <TestConsumer onValue={() => {}} />
        </AuthProvider>,
      )
    })

    // onAuthStateChange が登録されるまで待つ
    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled()
    })

    // コールバックが設定されていることを確認
    expect(onAuthCallback).toBeDefined()

    await act(async () => {
      _component!.unmount()
    })

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
