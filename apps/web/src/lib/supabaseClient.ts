import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigError = !url || !anonKey
  ? '環境変数 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY が設定されていません'
  : null

export const supabase = createClient(url ?? 'SUPABASE_URL_NOT_SET', anonKey ?? 'SUPABASE_ANON_KEY_NOT_SET', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
