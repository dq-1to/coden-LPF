-- v5roadmap06 M1: notifications / notification_reads foundation
-- Run this in Supabase SQL Editor (または supabase db push)
-- 目的:
--   Coden のアプリ内通知を「ポスト / お知らせ」として扱うため、
--   通知本体とユーザーごとの既読状態を分離して保存する。

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  body text not null,
  target_role text not null,
  created_by uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint notifications_type_check check (
    type in ('announcement', 'release', 'event', 'feedback', 'system')
  ),
  constraint notifications_target_role_check check (
    target_role in ('all', 'learner', 'admin')
  ),
  constraint notifications_title_length_check check (char_length(title) between 1 and 120),
  constraint notifications_body_length_check check (char_length(body) between 1 and 4000)
);

create table if not exists public.notification_reads (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

alter table public.notifications enable row level security;
alter table public.notification_reads enable row level security;

create index if not exists notifications_published_at_idx
  on public.notifications (published_at desc);

create index if not exists notifications_target_role_published_at_idx
  on public.notifications (target_role, published_at desc);

create index if not exists notification_reads_user_id_read_at_idx
  on public.notification_reads (user_id, read_at desc);

-- 配信対象に含まれるログインユーザーだけが通知を SELECT できる。
-- learner は profiles.is_admin = false として扱い、判定は既存の public.is_admin() を使う。
drop policy if exists notifications_select_visible on public.notifications;
create policy notifications_select_visible on public.notifications
  for select
  using (
    published_at <= now()
    and (
      target_role = 'all'
      or (target_role = 'admin' and public.is_admin())
      or (target_role = 'learner' and not public.is_admin())
    )
  );

-- admin だけが通知を作成できる。created_by は呼び出しユーザー本人に固定する。
drop policy if exists notifications_insert_admin on public.notifications;
create policy notifications_insert_admin on public.notifications
  for insert
  with check (
    public.is_admin()
    and auth.uid() = created_by
    and published_at <= now()
  );

-- MVP では通知本体の編集・削除は不可（UPDATE / DELETE ポリシー未定義）。

-- 既読状態は本人だけが SELECT できる。
drop policy if exists notification_reads_select_own on public.notification_reads;
create policy notification_reads_select_own on public.notification_reads
  for select
  using (auth.uid() = user_id);

-- 本人だけが自分の既読状態を作成できる。
-- notification_id は自分が SELECT 可能な通知に限定する。
drop policy if exists notification_reads_insert_own on public.notification_reads;
create policy notification_reads_insert_own on public.notification_reads
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.notifications n
      where n.id = notification_id
        and n.published_at <= now()
        and (
          n.target_role = 'all'
          or (n.target_role = 'admin' and public.is_admin())
          or (n.target_role = 'learner' and not public.is_admin())
        )
    )
  );

-- 既読時刻の再更新も本人のみ許可する。
drop policy if exists notification_reads_update_own on public.notification_reads;
create policy notification_reads_update_own on public.notification_reads
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.notifications n
      where n.id = notification_id
        and n.published_at <= now()
        and (
          n.target_role = 'all'
          or (n.target_role = 'admin' and public.is_admin())
          or (n.target_role = 'learner' and not public.is_admin())
        )
    )
  );

-- DELETE は誰も不可（ポリシー未定義）。
