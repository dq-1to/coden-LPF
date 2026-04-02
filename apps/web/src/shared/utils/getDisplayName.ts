import type { User } from '@supabase/supabase-js'

type DisplayNameUser = Pick<User, 'email' | 'user_metadata'> | null | undefined

export function getDisplayName(user: DisplayNameUser): string {
  const metadataName = user?.user_metadata?.display_name
  if (typeof metadataName === 'string' && metadataName.trim().length > 0) {
    return metadataName.trim()
  }

  if (typeof user?.email === 'string' && user.email.length > 0) {
    return user.email.split('@')[0] ?? user.email
  }

  return 'ゲスト'
}
