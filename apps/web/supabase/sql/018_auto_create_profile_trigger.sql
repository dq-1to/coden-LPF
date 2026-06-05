-- Issue #254: サインアップ時に profiles レコードを自動作成するトリガー + 既存ユーザー補完
--
-- 構成:
--   1. handle_new_user() トリガー関数（SECURITY DEFINER で RLS をバイパス）
--   2. auth.users AFTER INSERT トリガー
--   3. 既存ユーザーの profiles 一括補完

-- =========================================================================
-- 1. トリガー関数
--    auth.users に新規行が挿入されたときに profiles を自動作成する。
--    SECURITY DEFINER にすることで RLS の INSERT ポリシーをバイパスする。
-- =========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, is_admin, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', null),
    false,
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- =========================================================================
-- 2. トリガー定義
-- =========================================================================

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- 3. 既存ユーザーの profiles 一括補完
--    auth.users に存在するが profiles に行がないユーザーを補完する。
-- =========================================================================

insert into public.profiles (id, display_name, is_admin, created_at)
select
  au.id,
  null,
  false,
  au.created_at
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null;
