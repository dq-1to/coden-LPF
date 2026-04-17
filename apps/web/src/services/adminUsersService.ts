/**
 * 管理者向けユーザー閲覧サービス
 *
 * - listUsers: admin_list_users RPC（auth.users.email を取得するため SECURITY DEFINER RPC）
 * - getUserDetail: 複数テーブルを横断取得（013/014 で追加した admin 用 SELECT ポリシーに依存）
 *
 * RPC / クエリ失敗時は fromSupabaseError で AppError に変換する。
 * 日付指定が無い系の統計以外、ユーザー ID は常に UUID バリデーションする。
 */

import { supabase } from '../lib/supabaseClient'
import { fromSupabaseError } from '../shared/errors'
import { assertUuid } from '../shared/validation'
import type { Tables } from '../shared/types/database.types'

export interface AdminUserSummary {
  userId: string
  email: string | null
  displayName: string | null
  isAdmin: boolean
  totalPoints: number
  currentStreak: number
  maxStreak: number
  lastStudyDate: string | null
  badgeCount: number
  createdAt: string
}

export interface AdminUserBasic {
  userId: string
  email: string | null
  displayName: string | null
  isAdmin: boolean
  createdAt: string
}

export interface AdminUserDetail {
  profile: {
    userId: string
    displayName: string | null
    isAdmin: boolean
    createdAt: string
  }
  stats: {
    totalPoints: number
    currentStreak: number
    maxStreak: number
    lastStudyDate: string | null
    updatedAt: string
  } | null
  stepProgress: Tables<'step_progress'>[]
  recentSubmissions: Tables<'challenge_submissions'>[]
  dailyHistory: Tables<'daily_challenge_history'>[]
  achievements: Tables<'achievements'>[]
  codeDoctor: Tables<'code_doctor_progress'>[]
  miniProject: Tables<'mini_project_progress'>[]
  codeReading: Tables<'code_reading_progress'>[]
  baseNook: Tables<'base_nook_progress'>[]
  pointHistory: Tables<'point_history'>[]
}

/**
 * 管理者向けユーザー基本情報（単一ユーザー）を取得する。
 * フィードバック詳細などの「送信者が誰か」を軽量に把握する用途。
 * admin_get_user_basic RPC は SECURITY DEFINER + is_admin() ガードで非 admin をブロックする。
 * 対象ユーザーが存在しない場合は null を返す。
 */
export async function getUserBasicInfo(
  userId: string,
): Promise<AdminUserBasic | null> {
  assertUuid(userId, 'userId')
  const { data, error } = await supabase.rpc('admin_get_user_basic', {
    p_user_id: userId,
  })
  if (error) {
    throw fromSupabaseError(error, 'ユーザー情報の取得に失敗しました')
  }
  const row = (data ?? [])[0]
  if (!row) return null
  return {
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    isAdmin: row.is_admin,
    createdAt: row.created_at,
  }
}

/** 管理者向けユーザー一覧を取得（admin_list_users RPC） */
export async function listUsers(): Promise<AdminUserSummary[]> {
  const { data, error } = await supabase.rpc('admin_list_users')
  if (error) {
    throw fromSupabaseError(error, 'ユーザー一覧の取得に失敗しました')
  }
  return (data ?? []).map((row) => ({
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    isAdmin: row.is_admin,
    totalPoints: row.total_points,
    currentStreak: row.current_streak,
    maxStreak: row.max_streak,
    lastStudyDate: row.last_study_date,
    badgeCount: row.badge_count,
    createdAt: row.created_at,
  }))
}

/**
 * ユーザー詳細（各種進捗・履歴）を並列取得する。
 * 監視対象ユーザーの各テーブルを admin 用 RLS ポリシー経由で SELECT する。
 * 一部テーブルで 0 件でもエラーではない（取得できない列のみエラー扱い）。
 */
export async function getUserDetail(userId: string): Promise<AdminUserDetail | null> {
  assertUuid(userId, 'userId')

  const [
    profileRes,
    statsRes,
    stepRes,
    submissionsRes,
    dailyRes,
    achievementsRes,
    doctorRes,
    projectRes,
    readingRes,
    baseNookRes,
    pointsRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('learning_stats').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('step_progress').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    supabase
      .from('challenge_submissions')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(30),
    supabase
      .from('daily_challenge_history')
      .select('*')
      .eq('user_id', userId)
      .order('challenge_date', { ascending: false })
      .limit(60),
    supabase.from('achievements').select('*').eq('user_id', userId).order('earned_at', { ascending: false }),
    supabase.from('code_doctor_progress').select('*').eq('user_id', userId),
    supabase.from('mini_project_progress').select('*').eq('user_id', userId),
    supabase.from('code_reading_progress').select('*').eq('user_id', userId),
    supabase.from('base_nook_progress').select('*').eq('user_id', userId).order('answered_at', { ascending: false }),
    supabase
      .from('point_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  // profile 取得が 0 件ならユーザー自体が存在しない扱い
  if (profileRes.error) {
    throw fromSupabaseError(profileRes.error, 'ユーザー情報の取得に失敗しました')
  }
  if (profileRes.data === null) {
    return null
  }

  // 他テーブルの error は fail-loud で例外化
  for (const res of [
    statsRes,
    stepRes,
    submissionsRes,
    dailyRes,
    achievementsRes,
    doctorRes,
    projectRes,
    readingRes,
    baseNookRes,
    pointsRes,
  ] as const) {
    if (res.error) {
      throw fromSupabaseError(res.error, 'ユーザー詳細の取得に失敗しました')
    }
  }

  return {
    profile: {
      userId: profileRes.data.id,
      displayName: profileRes.data.display_name,
      isAdmin: profileRes.data.is_admin,
      createdAt: profileRes.data.created_at,
    },
    stats: statsRes.data
      ? {
          totalPoints: statsRes.data.total_points,
          currentStreak: statsRes.data.current_streak,
          maxStreak: statsRes.data.max_streak,
          lastStudyDate: statsRes.data.last_study_date,
          updatedAt: statsRes.data.updated_at,
        }
      : null,
    stepProgress: stepRes.data ?? [],
    recentSubmissions: submissionsRes.data ?? [],
    dailyHistory: dailyRes.data ?? [],
    achievements: achievementsRes.data ?? [],
    codeDoctor: doctorRes.data ?? [],
    miniProject: projectRes.data ?? [],
    codeReading: readingRes.data ?? [],
    baseNook: baseNookRes.data ?? [],
    pointHistory: pointsRes.data ?? [],
  }
}
