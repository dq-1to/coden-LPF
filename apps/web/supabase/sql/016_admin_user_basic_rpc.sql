-- v4roadmap02: 管理者向けユーザー基本情報 RPC
-- Run this in Supabase SQL Editor (または supabase db push)
--
-- 構成:
--   1. admin_get_user_basic RPC
--      単一ユーザーの基本情報（表示名・メール・管理者フラグ・登録日）を返す。
--      フィードバック詳細ページから呼び出してトリアージを高速化する用途。
--
-- セキュリティ:
--   - SECURITY DEFINER + set search_path = public
--   - 本体で public.is_admin() ガードを効かせ、非 admin からの呼び出しを封じる
--   - auth.users.email を authenticated ロールから直接参照できないため、
--     014 の admin_list_users と同じパターンで join して返す

-- =========================================================================
-- 1. admin_get_user_basic
--    対象ユーザーが存在しない / 非 admin からの呼び出しは 0 行を返す。
-- =========================================================================

create or replace function public.admin_get_user_basic(p_user_id uuid)
returns table (
  user_id      uuid,
  email        text,
  display_name text,
  is_admin     boolean,
  created_at   timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    au.email::text as email,
    p.display_name,
    coalesce(p.is_admin, false) as is_admin,
    p.created_at
  from public.profiles p
  left join auth.users au on au.id = p.id
  where p.id = p_user_id
    and public.is_admin()
  limit 1;
$$;

grant execute on function public.admin_get_user_basic(uuid) to authenticated;
