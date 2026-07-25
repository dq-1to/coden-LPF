import fs from 'node:fs'
import path from 'node:path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { accounts } from './accounts'

/**
 * E2E が作成した review_items を、テストユーザー本人の権限で削除するヘルパー。
 *
 * - service role key は使わない。public anon key + 対象ユーザーの session で DELETE する
 *   （review_items の own DELETE RLS をそのまま通す）。
 * - 削除対象はテストが使う step_id / mode / question_id に限定する。他ユーザー・他テストの行は触らない。
 *
 * 正解後の item は stage 1 / open / 翌日待ちで残るため、cleanup がないと
 * 24時間後の再実行で「due なし」という初期状態が崩れる。
 */
export interface ReviewItemTarget {
  stepId: string
  mode: 'practice' | 'test' | 'challenge' | 'daily'
  questionId?: string | null
}

/** vite が読む apps/web/.env.local を Node 側でも参照できるようにする */
function readEnvLocal(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), 'apps/web/.env.local')
  if (!fs.existsSync(envPath)) return {}

  const parsed: Record<string, string> = {}
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) continue

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '')
    parsed[key] = value
  }

  return parsed
}

function resolveSupabaseConfig(): { url: string; anonKey: string } {
  const envLocal = readEnvLocal()
  const url = process.env.VITE_SUPABASE_URL ?? envLocal.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? envLocal.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'review cleanup には VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY が必要です（apps/web/.env.local か環境変数で設定してください）',
    )
  }

  return { url, anonKey }
}

let clientPromise: Promise<{ client: SupabaseClient; userId: string }> | null = null

/** general テストユーザーとして認証済みの anon client を返す（プロセス内で使い回す） */
function getGeneralClient(): Promise<{ client: SupabaseClient; userId: string }> {
  if (clientPromise) return clientPromise

  clientPromise = (async () => {
    const { url, anonKey } = resolveSupabaseConfig()
    const client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data, error } = await client.auth.signInWithPassword({
      email: accounts.general.email,
      password: accounts.general.password,
    })

    if (error || !data.user) {
      throw new Error(`review cleanup のログインに失敗しました: ${error?.message ?? 'unknown'}`)
    }

    return { client, userId: data.user.id }
  })()

  return clientPromise
}

/**
 * 指定した review item を本人権限で削除する。
 * 対象が存在しない場合も成功として扱う（前回失敗時の残骸掃除と後片付けの両方で使う）。
 */
export async function deleteReviewItems(targets: ReviewItemTarget[]): Promise<void> {
  const { client, userId } = await getGeneralClient()

  for (const target of targets) {
    const questionId = target.questionId?.trim() ? target.questionId.trim() : null
    const query = client
      .from('review_items')
      .delete()
      .eq('user_id', userId)
      .eq('step_id', target.stepId)
      .eq('mode', target.mode)

    const { error } = await (questionId
      ? query.eq('question_id', questionId)
      : query.is('question_id', null))

    if (error) {
      throw new Error(`review item の削除に失敗しました: ${error.message}`)
    }
  }
}

/** 対象 review item の現在のスケジュール状態を取得する（DB保存結果の検証用） */
export async function getReviewItemState(target: ReviewItemTarget): Promise<{
  status: string
  review_stage: number
  next_review_at: string
} | null> {
  const { client, userId } = await getGeneralClient()

  const questionId = target.questionId?.trim() ? target.questionId.trim() : null
  const query = client
    .from('review_items')
    .select('status, review_stage, next_review_at')
    .eq('user_id', userId)
    .eq('step_id', target.stepId)
    .eq('mode', target.mode)

  const { data, error } = await (questionId
    ? query.eq('question_id', questionId)
    : query.is('question_id', null)
  ).maybeSingle()

  if (error) {
    throw new Error(`review item の取得に失敗しました: ${error.message}`)
  }

  return data as { status: string; review_stage: number; next_review_at: string } | null
}
