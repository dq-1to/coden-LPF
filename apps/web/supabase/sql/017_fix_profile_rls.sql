-- C-1: profiles テーブル is_admin RLS 修正
-- Issue: #249
--
-- 脆弱性: own_profile ポリシーが for all で設定されており、
-- ユーザーが DevTools から is_admin = true に書き換えて管理者権限を取得可能。
--
-- 修正: own_profile を操作別に分割し、is_admin の変更を構造的に防止する。

-- =========================================================================
-- 1. 既存の for all ポリシーを削除
-- =========================================================================

drop policy if exists own_profile on public.profiles;

-- =========================================================================
-- 2. SELECT: 自分のプロフィールを読取可能
-- =========================================================================

create policy own_profile_select on public.profiles
  for select using (auth.uid() = id);

-- =========================================================================
-- 3. INSERT: 自分のプロフィールを作成可能（is_admin は false 固定）
-- =========================================================================

create policy own_profile_insert on public.profiles
  for insert with check (auth.uid() = id and is_admin = false);

-- =========================================================================
-- 4. UPDATE: 自分のプロフィールを更新可能（is_admin の変更は不可）
--    with check で is_admin の新しい値が現在の値と一致することを強制する。
--    public.is_admin() は SECURITY DEFINER + set search_path = public なので
--    RLS 再帰は発生しない。
-- =========================================================================

create policy own_profile_update on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin is not distinct from public.is_admin()
  );

-- =========================================================================
-- 5. DELETE: ポリシーなし = 全拒否（削除は Supabase Auth cascade に任せる）
-- =========================================================================
-- 意図的にポリシーを定義しない
