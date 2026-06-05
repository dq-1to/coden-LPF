-- v4roadmap02 M3: 管理者運用 RPC（手動ポイント付与 / 手動バッジ付与）
-- Run this in Supabase SQL Editor (または supabase db push)
--
-- 構成:
--   1. admin_grant_points  -- 任意のユーザーに運用ポイントを付与し、履歴+監査ログを残す
--   2. admin_grant_badge   -- 任意のユーザーにバッジを手動付与し、監査ログを残す
--
-- セキュリティ:
--   - SECURITY DEFINER + set search_path = public
--   - 冒頭で public.is_admin() を確認し、非 admin 呼び出しを拒否
--   - 対象ユーザーの存在確認（profiles.id の存在）
--   - amount は正整数のみ許可、reason / badge_id は空文字・長大を拒否
--   - admin_audit_log への INSERT は監査のため fail-loud（例外時はトランザクション全体ロールバック）

-- =========================================================================
-- 1. admin_grant_points
--    learning_stats.total_points を加算し、point_history に履歴を残す。
--    同時に admin_audit_log に監査レコードを残す。
--    減算（マイナス付与）は現段階では対象外とし、正整数のみ受け付ける。
-- =========================================================================

create or replace function public.admin_grant_points(
  p_target_user_id uuid,
  p_amount         integer,
  p_reason         text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_exists   boolean;
begin
  -- 権限チェック
  if v_admin_id is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  -- 入力バリデーション
  if p_target_user_id is null then
    raise exception 'target_user_id is required';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be a positive integer';
  end if;
  if p_amount > 10000 then
    raise exception 'amount exceeds max (10000)';
  end if;
  if p_reason is null or char_length(btrim(p_reason)) = 0 then
    raise exception 'reason is required';
  end if;
  if char_length(p_reason) > 200 then
    raise exception 'reason is too long (max 200)';
  end if;

  -- 対象ユーザーの存在確認
  select exists(select 1 from public.profiles where id = p_target_user_id)
    into v_exists;
  if not v_exists then
    raise exception 'target user not found';
  end if;

  -- ポイント加算（行が無ければ INSERT）
  insert into public.learning_stats (user_id, total_points, updated_at)
  values (p_target_user_id, p_amount, now())
  on conflict (user_id) do update
    set total_points = public.learning_stats.total_points + excluded.total_points,
        updated_at   = now();

  -- ポイント履歴
  insert into public.point_history (user_id, amount, reason)
  values (p_target_user_id, p_amount, p_reason);

  -- 監査ログ
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    v_admin_id,
    'admin.grant_points',
    'user',
    p_target_user_id::text,
    jsonb_build_object(
      'amount', p_amount,
      'reason', p_reason
    )
  );
end;
$$;

grant execute on function public.admin_grant_points(uuid, integer, text) to authenticated;

-- =========================================================================
-- 2. admin_grant_badge
--    achievements に (user_id, badge_id) を INSERT する。
--    既に保有している場合は do nothing（同じバッジを重複付与しても 1 件）。
--    監査ログには was_new（新規付与かどうか）を記録する。
-- =========================================================================

create or replace function public.admin_grant_badge(
  p_target_user_id uuid,
  p_badge_id       text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_exists   boolean;
  v_inserted integer;
begin
  -- 権限チェック
  if v_admin_id is null then
    raise exception 'Not authenticated';
  end if;
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  -- 入力バリデーション
  if p_target_user_id is null then
    raise exception 'target_user_id is required';
  end if;
  if p_badge_id is null or char_length(btrim(p_badge_id)) = 0 then
    raise exception 'badge_id is required';
  end if;
  if char_length(p_badge_id) > 100 then
    raise exception 'badge_id is too long (max 100)';
  end if;

  -- 対象ユーザー存在確認
  select exists(select 1 from public.profiles where id = p_target_user_id)
    into v_exists;
  if not v_exists then
    raise exception 'target user not found';
  end if;

  -- バッジ INSERT（既保持なら do nothing）
  with ins as (
    insert into public.achievements (user_id, badge_id)
    values (p_target_user_id, p_badge_id)
    on conflict (user_id, badge_id) do nothing
    returning 1
  )
  select count(*)::int into v_inserted from ins;

  -- 監査ログ
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    v_admin_id,
    'admin.grant_badge',
    'user',
    p_target_user_id::text,
    jsonb_build_object(
      'badge_id', p_badge_id,
      'was_new',  v_inserted > 0
    )
  );
end;
$$;

grant execute on function public.admin_grant_badge(uuid, text) to authenticated;
