-- v4roadmap02 M1: 管理者フラグ + ユーザーフィードバック + 監査ログ
-- Run this in Supabase SQL Editor (または supabase db push)
--
-- 構成:
--   1. profiles.is_admin 列を追加
--   2. is_admin() ヘルパー関数（SECURITY DEFINER で RLS 再帰を回避）
--   3. user_feedback テーブル + RLS
--   4. admin_audit_log テーブル + RLS
--   5. updated_at トリガー / インデックス

-- =========================================================================
-- 1. profiles.is_admin 追加
-- =========================================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- =========================================================================
-- 2. is_admin() ヘルパー関数
--    RLS 内で profiles を参照すると recursive policy が発生する恐れがあるため、
--    SECURITY DEFINER で公開スキーマに固定し、呼び出し側ポリシーで使う。
-- =========================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  )
$$;

grant execute on function public.is_admin() to authenticated;

-- =========================================================================
-- 3. user_feedback テーブル
-- =========================================================================

create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('bug', 'review', 'request', 'other')),
  message text not null check (char_length(message) between 1 and 4000),
  page_url text,
  user_agent text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'archived')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_feedback_status_created_at
  on public.user_feedback (status, created_at desc);

create index if not exists idx_user_feedback_user_id
  on public.user_feedback (user_id);

alter table public.user_feedback enable row level security;

-- 本人は自分のフィードバックを INSERT できる
drop policy if exists user_feedback_insert_own on public.user_feedback;
create policy user_feedback_insert_own on public.user_feedback
  for insert
  with check (auth.uid() = user_id);

-- 本人は自分のフィードバックを SELECT できる（INSERT 後の returning に必要）
drop policy if exists user_feedback_select_own on public.user_feedback;
create policy user_feedback_select_own on public.user_feedback
  for select
  using (auth.uid() = user_id);

-- admin は全件 SELECT できる
drop policy if exists user_feedback_select_admin on public.user_feedback;
create policy user_feedback_select_admin on public.user_feedback
  for select
  using (public.is_admin());

-- admin は status / admin_note を UPDATE できる
drop policy if exists user_feedback_update_admin on public.user_feedback;
create policy user_feedback_update_admin on public.user_feedback
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- DELETE は誰も不可（ポリシー未定義 = 全拒否）

-- updated_at 自動更新トリガー
create or replace function public.set_user_feedback_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_user_feedback_updated_at on public.user_feedback;
create trigger trg_user_feedback_updated_at
  before update on public.user_feedback
  for each row execute function public.set_user_feedback_updated_at();

-- =========================================================================
-- 4. admin_audit_log テーブル
--    運用操作（ポイント付与・フィードバック対応等）の監査ログ。
--    admin 以外の書き込みは RLS で拒否し、後続 M で RPC 経由のみ書き込み可とする。
-- =========================================================================

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_log_created_at
  on public.admin_audit_log (created_at desc);

create index if not exists idx_admin_audit_log_admin_id
  on public.admin_audit_log (admin_id);

alter table public.admin_audit_log enable row level security;

-- admin は全件 SELECT できる
drop policy if exists admin_audit_log_select_admin on public.admin_audit_log;
create policy admin_audit_log_select_admin on public.admin_audit_log
  for select
  using (public.is_admin());

-- admin は自身の admin_id で INSERT できる
-- （通常は SECURITY DEFINER RPC から書き込むが、直 INSERT も admin なら許可）
drop policy if exists admin_audit_log_insert_admin on public.admin_audit_log;
create policy admin_audit_log_insert_admin on public.admin_audit_log
  for insert
  with check (public.is_admin() and auth.uid() = admin_id);

-- UPDATE / DELETE は全拒否（ポリシー未定義）
