import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import { assertMaxLength, assertOneOf, assertUuid } from '../shared/validation'
import type { Json, Tables } from '../shared/types/database.types'

export type UserFeedback = Tables<'user_feedback'>

export type FeedbackCategory = 'bug' | 'review' | 'request' | 'other'
export type FeedbackStatus = 'new' | 'in_progress' | 'resolved' | 'archived'

export const FEEDBACK_CATEGORIES: ReadonlySet<string> = new Set([
  'bug',
  'review',
  'request',
  'other',
])

export const FEEDBACK_STATUSES: ReadonlySet<string> = new Set([
  'new',
  'in_progress',
  'resolved',
  'archived',
])

export function isFeedbackCategory(value: string): value is FeedbackCategory {
  return FEEDBACK_CATEGORIES.has(value)
}

export function isFeedbackStatus(value: string): value is FeedbackStatus {
  return FEEDBACK_STATUSES.has(value)
}

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: '不具合報告',
  review: 'レビュー',
  request: '要望',
  other: 'その他',
}

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: '新規',
  in_progress: '対応中',
  resolved: '対応済み',
  archived: 'アーカイブ',
}

/** 添付画像の最大枚数 */
export const MAX_IMAGE_COUNT = 3
/** 添付画像の最大サイズ（5 MB） */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
/** Storage バケット名 */
export const FEEDBACK_IMAGES_BUCKET = 'feedback-images'

/** 本文の最大文字数（DB 側制約 4000 と一致させる） */
export const MAX_FEEDBACK_MESSAGE_LENGTH = 4000
/** page_url の最大文字数（長大な URL で DB を肥大化させないため短めに丸める） */
export const MAX_PAGE_URL_LENGTH = 500
/** user_agent の最大文字数 */
export const MAX_USER_AGENT_LENGTH = 500
/** admin_note の最大文字数 */
export const MAX_ADMIN_NOTE_LENGTH = 2000

type AuditAction =
  | 'feedback.status_updated'
  | 'feedback.note_updated'

/**
 * admin_audit_log に INSERT する。
 * 監査ログの失敗はユーザー向け操作を巻き戻したくないため、呼び出し側で例外を握り潰さず
 * そのままスローする（= 監査ログに記録できないときは元操作も失敗扱いにする）。
 *
 * RLS: `admin_audit_log_insert_admin` により `auth.uid() = admin_id` が強制される。
 */
async function insertAuditLog(entry: {
  adminId: string
  action: AuditAction
  targetType: string
  targetId: string
  payload: Record<string, unknown>
}): Promise<void> {
  assertUuid(entry.adminId, 'adminId')
  const { error } = await supabase.from('admin_audit_log').insert({
    admin_id: entry.adminId,
    action: entry.action,
    target_type: entry.targetType,
    target_id: entry.targetId,
    payload: entry.payload as Json,
  })
  if (error) {
    throw fromSupabaseError(error, '監査ログの記録に失敗しました')
  }
}

// ─── ユーザー操作 ────────────────────────────────────────

export interface SubmitFeedbackInput {
  userId: string
  category: FeedbackCategory
  message: string
  pageUrl?: string | null
  userAgent?: string | null
  /** 添付する画像ファイル（最大3枚、各5MB以下） */
  files?: File[]
}

/**
 * ユーザーがフィードバックを送信する。
 * RLS `user_feedback_insert_own` により `auth.uid() = user_id` が強制されるため、
 * クライアント側で user_id を詐称しても DB 側で弾かれる。
 */
export async function submitFeedback(input: SubmitFeedbackInput): Promise<UserFeedback> {
  assertUuid(input.userId, 'userId')
  assertOneOf(input.category, FEEDBACK_CATEGORIES, 'category')

  const trimmedMessage = input.message.trim()
  if (trimmedMessage.length === 0) {
    throw new Error('message must not be empty')
  }
  assertMaxLength(trimmedMessage, MAX_FEEDBACK_MESSAGE_LENGTH, 'message')

  // 画像バリデーション
  const files = input.files ?? []
  validateImageFiles(files)

  const normalizedPageUrl = normalizeOptionalText(input.pageUrl, MAX_PAGE_URL_LENGTH)
  const normalizedUserAgent = normalizeOptionalText(input.userAgent, MAX_USER_AGENT_LENGTH)

  // 1. feedback レコードを INSERT
  const { data, error } = await supabase
    .from('user_feedback')
    .insert({
      user_id: input.userId,
      category: input.category,
      message: trimmedMessage,
      page_url: normalizedPageUrl,
      user_agent: normalizedUserAgent,
    })
    .select()
    .single()

  if (error) {
    throw fromSupabaseError(error, 'フィードバックの送信に失敗しました')
  }

  // 2. 画像があれば Storage にアップロードし image_paths を UPDATE
  if (files.length > 0) {
    const paths = await uploadFeedbackImages(input.userId, data.id, files)
    const { data: updated, error: updateError } = await supabase
      .from('user_feedback')
      .update({ image_paths: paths as Json[] })
      .eq('id', data.id)
      .select()
      .single()

    if (updateError) {
      throw fromSupabaseError(updateError, '画像パスの保存に失敗しました')
    }
    return updated
  }

  return data
}

/**
 * 画像ファイルのバリデーション。
 * - 枚数: MAX_IMAGE_COUNT 以下
 * - 各ファイルサイズ: MAX_IMAGE_SIZE_BYTES 以下
 * - MIME タイプ: image/* のみ
 */
export function validateImageFiles(files: File[]): void {
  if (files.length > MAX_IMAGE_COUNT) {
    throw new Error(`画像は最大 ${MAX_IMAGE_COUNT} 枚まで添付できます`)
  }
  for (const file of files) {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error(`${file.name} のサイズが上限（5MB）を超えています`)
    }
    if (!file.type.startsWith('image/')) {
      throw new Error(`${file.name} は画像ファイルではありません`)
    }
  }
}

/**
 * Storage にフィードバック画像をアップロードし、保存パスの配列を返す。
 * パス構造: {userId}/{feedbackId}/{filename}
 */
export async function uploadFeedbackImages(
  userId: string,
  feedbackId: string,
  files: File[],
): Promise<string[]> {
  const paths: string[] = []

  for (const file of files) {
    // ファイル名の衝突を避けるため timestamp を付与
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const path = `${userId}/${feedbackId}/${safeName}`

    const { error } = await supabase.storage
      .from(FEEDBACK_IMAGES_BUCKET)
      .upload(path, file, { contentType: file.type })

    if (error) {
      throw fromSupabaseError(
        { code: 'STORAGE_ERROR', message: error.message },
        `画像「${file.name}」のアップロードに失敗しました`,
      )
    }
    paths.push(path)
  }

  return paths
}

function normalizeOptionalText(value: string | null | undefined, maxLength: number): string | null {
  if (value === null || value === undefined) return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed
}

// ─── 管理者操作 ───────────────────────────────────────────

export interface ListFeedbackFilter {
  category?: FeedbackCategory
  status?: FeedbackStatus
  limit?: number
}

/** admin 向けにフィードバック一覧を取得する（新着順） */
export async function listFeedback(filter: ListFeedbackFilter = {}): Promise<UserFeedback[]> {
  let query = supabase
    .from('user_feedback')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter.category) {
    assertOneOf(filter.category, FEEDBACK_CATEGORIES, 'category')
    query = query.eq('category', filter.category)
  }
  if (filter.status) {
    assertOneOf(filter.status, FEEDBACK_STATUSES, 'status')
    query = query.eq('status', filter.status)
  }
  if (filter.limit !== undefined) {
    const safeLimit = Math.max(1, Math.min(filter.limit, 500))
    query = query.limit(safeLimit)
  }

  const { data, error } = await query
  if (error) {
    throw fromSupabaseError(error, 'フィードバック一覧の取得に失敗しました')
  }
  return data ?? []
}

/** 単一のフィードバックを取得する */
export async function getFeedback(id: string): Promise<UserFeedback | null> {
  assertUuid(id, 'id')
  const { data, error } = await supabase
    .from('user_feedback')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) {
    throw fromSupabaseError(error, 'フィードバックの取得に失敗しました')
  }
  return data
}

/**
 * フィードバックのステータスを更新し、同時に admin_audit_log に記録する。
 * - adminId は必ず `auth.uid()` と一致させる必要がある（RLS で強制）
 * - UPDATE と監査ログ INSERT は 2 クエリで実行するが、
 *   監査ログ側のエラーは握り潰さず例外を投げる（追跡不能を防ぐ）
 */
export async function updateFeedbackStatus(
  id: string,
  nextStatus: FeedbackStatus,
  adminId: string,
): Promise<UserFeedback> {
  assertUuid(id, 'id')
  assertUuid(adminId, 'adminId')
  assertOneOf(nextStatus, FEEDBACK_STATUSES, 'status')

  const { data, error } = await supabase
    .from('user_feedback')
    .update({ status: nextStatus })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw fromSupabaseError(error, 'フィードバックのステータス更新に失敗しました')
  }

  await insertAuditLog({
    adminId,
    action: 'feedback.status_updated',
    targetType: 'user_feedback',
    targetId: id,
    payload: { status: nextStatus },
  })

  return data
}

/** フィードバックの admin_note を更新し、同時に admin_audit_log に記録する */
export async function updateFeedbackNote(
  id: string,
  nextNote: string | null,
  adminId: string,
): Promise<UserFeedback> {
  assertUuid(id, 'id')
  assertUuid(adminId, 'adminId')

  const normalizedNote = normalizeOptionalText(nextNote, MAX_ADMIN_NOTE_LENGTH)

  const { data, error } = await supabase
    .from('user_feedback')
    .update({ admin_note: normalizedNote })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw fromSupabaseError(error, 'フィードバックのメモ更新に失敗しました')
  }

  await insertAuditLog({
    adminId,
    action: 'feedback.note_updated',
    targetType: 'user_feedback',
    targetId: id,
    payload: { note_length: normalizedNote?.length ?? 0 },
  })

  return data
}

// ─── 画像 URL ────────────────────────────────────────────

/** signed URL の有効期限（秒）: 1 時間 */
const SIGNED_URL_EXPIRES_IN = 3600

export interface FeedbackImageUrl {
  path: string
  url: string
}

/**
 * image_paths から signed URL を一括生成する（admin 向け）。
 * Storage RLS `feedback_images_select_admin` により admin のみ全画像を閲覧可能。
 */
export async function getFeedbackImageUrls(
  paths: string[],
): Promise<FeedbackImageUrl[]> {
  if (paths.length === 0) return []

  const { data, error } = await supabase.storage
    .from(FEEDBACK_IMAGES_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_EXPIRES_IN)

  if (error) {
    throw fromSupabaseError(
      { code: 'STORAGE_ERROR', message: error.message },
      '画像 URL の生成に失敗しました',
    )
  }

  return (data ?? [])
    .filter((item) => item.signedUrl)
    .map((item) => ({ path: item.path ?? '', url: item.signedUrl }))
}

// ─── ユーティリティ ──────────────────────────────────────

/** 現在のページ情報から送信元メタデータを取得する（クライアント専用） */
export function captureClientMeta(): { pageUrl: string; userAgent: string } {
  const pathname = typeof window === 'undefined' ? '' : window.location.pathname
  const search = typeof window === 'undefined' ? '' : window.location.search
  const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent
  return {
    pageUrl: `${pathname}${search}`.slice(0, MAX_PAGE_URL_LENGTH),
    userAgent: userAgent.slice(0, MAX_USER_AGENT_LENGTH),
  }
}
