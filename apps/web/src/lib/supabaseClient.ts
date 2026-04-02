import { createClient } from '@supabase/supabase-js'
import type { Database } from '../shared/types/database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigError = !url || !anonKey
  ? '環境変数 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY が設定されていません'
  : null

export const supabase = createClient<Database>(url ?? 'https://placeholder.supabase.co', anonKey ?? 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
