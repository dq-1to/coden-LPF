import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabaseConfigError } from '../lib/supabaseClient'
import { getProfile } from '../services/profileService'
import { getDisplayName } from '../shared/utils/getDisplayName'

/**
 * ユーザーのプロフィール display_name を取得し、greetingName を算出する共通フック。
 *
 * 内部で:
 * 1. `getProfile(userId)` で displayName を取得
 * 2. `getDisplayName()` で greetingName を算出（displayName > email > ゲスト）
 * 3. isMounted ガードでアンマウント後の state 更新を防止
 *
 * @returns `{ greetingName, displayName, setDisplayName }` — ProfilePage 等で表示名を更新する場合は setDisplayName を使用
 */
export function useGreetingName() {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [displayName, setDisplayName] = useState<string | null>(null)

  useEffect(() => {
    if (!userId || supabaseConfigError) {
      return
    }

    let isMounted = true

    void getProfile(userId).then((profile) => {
      if (isMounted) {
        setDisplayName(profile?.display_name ?? null)
      }
    })

    return () => {
      isMounted = false
    }
  }, [userId])

  const greetingName = useMemo(
    () =>
      getDisplayName(
        user
          ? {
              ...user,
              user_metadata: {
                ...user.user_metadata,
                display_name: displayName ?? user.user_metadata?.display_name,
              },
            }
          : null,
      ),
    [displayName, user],
  )

  return { greetingName, displayName, setDisplayName }
}
