/**
 * 管理者向け運用サービス
 *
 * 015_admin_ops_rpc.sql の RPC を薄くラップする。
 * DB 側でも is_admin() ガード + バリデーションが走るが、
 * クライアント側でも UX のために事前バリデーションする。
 */

import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import { assertMaxLength, assertPositiveInteger, assertUuid } from '../shared/validation'
import { BADGE_DEFINITIONS, type BadgeId } from './achievementService'

/** 単一ポイント付与の上限（過剰な一括付与を防ぐ） */
export const MAX_GRANT_POINTS_AMOUNT = 10000
/** 理由の最大文字数（DB 側の制約と揃える） */
export const MAX_GRANT_POINTS_REASON_LENGTH = 200

const BADGE_ID_SET = new Set<string>(BADGE_DEFINITIONS.map((b) => b.id))

export interface GrantPointsInput {
  targetUserId: string
  amount: number
  reason: string
}

export interface GrantBadgeInput {
  targetUserId: string
  badgeId: BadgeId
}

/**
 * 任意ユーザーにポイントを手動付与する。
 * DB 側で admin_audit_log への INSERT も同時に実行される（fail-loud）。
 */
export async function grantPoints(input: GrantPointsInput): Promise<void> {
  assertUuid(input.targetUserId, 'targetUserId')
  assertPositiveInteger(input.amount, 'amount')
  if (input.amount > MAX_GRANT_POINTS_AMOUNT) {
    throw new Error(`amount must be at most ${MAX_GRANT_POINTS_AMOUNT}`)
  }
  const trimmed = input.reason.trim()
  if (trimmed.length === 0) {
    throw new Error('reason must not be empty')
  }
  assertMaxLength(trimmed, MAX_GRANT_POINTS_REASON_LENGTH, 'reason')

  const { error } = await supabase.rpc('admin_grant_points', {
    p_target_user_id: input.targetUserId,
    p_amount: input.amount,
    p_reason: trimmed,
  })
  if (error) {
    throw fromSupabaseError(error, 'ポイントの付与に失敗しました')
  }
}

/** 任意ユーザーにバッジを手動付与する（既に所持していれば no-op 扱い。監査ログは記録） */
export async function grantBadge(input: GrantBadgeInput): Promise<void> {
  assertUuid(input.targetUserId, 'targetUserId')
  if (!BADGE_ID_SET.has(input.badgeId)) {
    throw new Error('unknown badge_id')
  }

  const { error } = await supabase.rpc('admin_grant_badge', {
    p_target_user_id: input.targetUserId,
    p_badge_id: input.badgeId,
  })
  if (error) {
    throw fromSupabaseError(error, 'バッジの付与に失敗しました')
  }
}
