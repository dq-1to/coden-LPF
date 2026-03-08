import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigError } from '../lib/supabaseClient'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (supabaseConfigError) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!isMounted) {
        return
      }

      try {
        if (event === 'SIGNED_OUT' || !nextSession?.user) {
          setSession(null)
          setUser(null)
        } else {
          setSession(nextSession)
          setUser(nextSession.user)
        }
      } catch {
        if (!isMounted) {
          return
        }

        setSession(null)
        setUser(null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    })

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) {
          return
        }

        setSession(data.session)
        setUser(data.session?.user ?? null)
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setSession(null)
        setUser(null)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      signIn: async (email, password) => {
        if (supabaseConfigError) {
          return supabaseConfigError
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return error?.message ?? null
      },
      signOut: async () => {
        if (supabaseConfigError) {
          return supabaseConfigError
        }

        const { error } = await supabase.auth.signOut()
        return error?.message ?? null
      },
    }),
    [isLoading, session, user],
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
