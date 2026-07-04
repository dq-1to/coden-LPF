-- v6roadmap09 M11-4: admin統計テストアカウント除外（Issue #319）
-- Run this in Supabase SQL Editor (または supabase db push)
--
-- 構成:
--   1. profiles.is_test_user 列を追加（集計除外用のフラグ。権限とは無関係）
--   2. own_profile_insert / own_profile_update を is_test_user も含めて再定義
--      （017_fix_profile_rls.sql で確立した「新しい値が現在の値と一致することを強制する」
--       WITH CHECK 方式を is_test_user にも適用する。同一ファイルで完結させるため
--       017 のポリシーを DROP AND CREATE で置き換える）
--
-- 選定理由（trigger ではなく WITH CHECK を選ぶ理由）:
--   - is_admin の自己書き換え防止が既に WITH CHECK 方式（017）で運用実績があり、
--     同じ列挙的ロジックを is_test_user にも足すだけで一貫した実装になる
--   - trigger 方式は BEFORE UPDATE で OLD/NEW を比較して RAISE EXCEPTION する実装が
--     必要になり、admin 経由の更新（is_test_user を運用者が設定するケース）を
--     許可する分岐が別途必要になる。本UPDATEポリシーは「本人による自分の行の
--     UPDATE」にのみ適用され、admin による他ユーザーの is_test_user 設定は
--     admin_select_profiles 等とは別に、SECURITY DEFINER RPC または
--     Supabase 管理コンソール／service role 経由での直接更新を想定するため、
--     本人経由の書き換えだけを塞げれば十分。WITH CHECK の方が既存規約との
--     一貫性が高く、可読性も高い

-- =========================================================================
-- 1. profiles.is_test_user 追加
-- =========================================================================

alter table public.profiles
  add column if not exists is_test_user boolean not null default false;

-- =========================================================================
-- 2. is_test_user() ヘルパー関数
--    is_admin() と同じ理由（RLS 再帰回避）で SECURITY DEFINER にする。
--    WITH CHECK 句内で「現在の is_test_user 値」を取得するために使う。
-- =========================================================================

create or replace function public.is_test_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_test_user from public.profiles p where p.id = auth.uid()),
    false
  )
$$;

grant execute on function public.is_test_user() to authenticated;

-- =========================================================================
-- 3. own_profile_insert / own_profile_update の再定義
--    is_admin に加えて is_test_user も本人からの書き換えを拒否する。
-- =========================================================================

drop policy if exists own_profile_insert on public.profiles;
create policy own_profile_insert on public.profiles
  for insert with check (
    auth.uid() = id
    and is_admin = false
    and is_test_user = false
  );

drop policy if exists own_profile_update on public.profiles;
create policy own_profile_update on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin is not distinct from public.is_admin()
    and is_test_user is not distinct from public.is_test_user()
  );
