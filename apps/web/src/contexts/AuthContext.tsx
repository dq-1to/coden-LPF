import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigError } from '../lib/supabaseClient'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoadingAuth: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | 'CONFIRM_EMAIL' | null>
  signOut: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const user = session?.user ?? null
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  useEffect(() => {
    if (supabaseConfigError) {
      setIsLoadingAuth(false)
      return
    }

    let isMounted = true
    let subscription: { unsubscribe: () => void } | undefined

    async function init() {
      // getSession を先に完了させてから onAuthStateChange を登録し、
      // トークンリフレッシュによるレースコンディションを防ぐ
      try {
        const { data } = await supabase.auth.getSession()
        if (!isMounted) return

        setSession(data.session)
      } catch {
        if (!isMounted) return

        setSession(null)
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false)
        }
      }

      if (!isMounted) return

      const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!isMounted) return
        setSession(nextSession)
      })
      subscription = sub.subscription
    }

    void init()

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoadingAuth,
      signIn: async (email, password) => {
        if (supabaseConfigError) {
          return supabaseConfigError
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return error?.message ?? null
      },
      signUp: async (email, password) => {
        if (supabaseConfigError) {
          return supabaseConfigError
        }

        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) {
          return error.message
        }

        // 既に登録済みのメールアドレス（identities が空）
        if (data.user && data.user.identities?.length === 0) {
          return 'このメールアドレスは既に登録されています。'
        }

        // セッションが返ってきた場合（メール確認無効時）
        if (data.session) {
          setSession(data.session)
          return null
        }

        // メール確認待ち
        return 'CONFIRM_EMAIL'
      },
      signOut: async () => {
        if (supabaseConfigError) {
          return supabaseConfigError
        }

        const { error } = await supabase.auth.signOut()
        return error?.message ?? null
      },
    }),
    [isLoadingAuth, session, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
