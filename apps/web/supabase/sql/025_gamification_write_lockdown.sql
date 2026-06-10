-- 025_gamification_write_lockdown.sql
-- Issue: #292
--
-- 脆弱性: learning_stats / point_history / achievements の own_* ポリシーが
-- for all のため、本人がクライアントから直接 UPDATE / INSERT でポイント・
-- ストリーク・バッジを改ざん可能。また award_points_tx に金額上限がなく、
-- 任意の正数ポイントを自己付与できる。
--
-- 修正:
--   1. 3テーブルの本人ポリシーを SELECT のみに分割（書き込みは RPC 経由に限定）
--   2. バッジ付与 RPC unlock_achievement_tx を新設（クライアント直 INSERT を置換）
--   3. award_points_tx に上限 (200) と reason 検証を追加
--
-- 注意: admin_select_* ポリシー（014）には影響しない。

-- =========================================================================
-- 1. own_* ポリシーを SELECT のみに分割
--    INSERT / UPDATE / DELETE はポリシー未定義 = 全拒否となり、
--    書き込みは SECURITY DEFINER RPC（award_points_tx /
--    record_study_activity / unlock_achievement_tx / admin_grant_*）に限定される。
-- =========================================================================

drop policy if exists own_learning_stats on public.learning_stats;
create policy own_learning_stats_select on public.learning_stats
  for select using (auth.uid() = user_id);

drop policy if exists own_point_history on public.point_history;
create policy own_point_history_select on public.point_history
  for select using (auth.uid() = user_id);

drop policy if exists own_achievements on public.achievements;
create policy own_achievements_select on public.achievements
  for select using (auth.uid() = user_id);

-- =========================================================================
-- 2. unlock_achievement_tx RPC
--    本人のバッジ解禁。既保持なら false を返す（重複付与しない）。
--    バッジ条件の判定はクライアント側（achievementService）で行う設計を
--    維持しつつ、書き込み経路だけを RPC に一本化する。
-- =========================================================================

create or replace function public.unlock_achievement_tx(
  p_badge_id text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id  uuid := auth.uid();
  v_inserted integer;
begin
  -- 認証チェック
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 入力バリデーション
  if p_badge_id is null or char_length(btrim(p_badge_id)) = 0 then
    raise exception 'badge_id is required';
  end if;
  if char_length(p_badge_id) > 100 then
    raise exception 'badge_id is too long (max 100)';
  end if;

  -- バッジ INSERT（既保持なら do nothing）
  with ins as (
    insert into public.achievements (user_id, badge_id)
    values (v_user_id, p_badge_id)
    on conflict (user_id, badge_id) do nothing
    returning 1
  )
  select count(*)::int into v_inserted from ins;

  return v_inserted > 0;
end;
$$;

grant execute on function public.unlock_achievement_tx(text) to authenticated;

-- =========================================================================
-- 3. award_points_tx に上限 + reason 検証を追加
--    アプリ内の最大単発付与は POINTS_MINI_PROJECT_COMPLETE = 100。
--    余裕を見て上限 200 とする（admin の手動付与は admin_grant_points 側で
--    上限 10000 を別途持つ）。
-- =========================================================================

create or replace function public.award_points_tx(
  p_amount   integer,
  p_reason   text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  -- 認証チェック
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 金額バリデーション
  if p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;
  if p_amount > 200 then
    raise exception 'Amount exceeds max (200)';
  end if;

  -- reason バリデーション
  if p_reason is null or char_length(btrim(p_reason)) = 0 then
    raise exception 'Reason is required';
  end if;
  if char_length(p_reason) > 200 then
    raise exception 'Reason is too long (max 200)';
  end if;

  -- total_points をアトミックに加算（行が存在しなければ INSERT）
  insert into public.learning_stats (user_id, total_points, updated_at)
  values (v_user_id, p_amount, now())
  on conflict (user_id) do update
    set total_points = public.learning_stats.total_points + excluded.total_points,
        updated_at   = now();

  -- ポイント履歴を記録
  insert into public.point_history (user_id, amount, reason)
  values (v_user_id, p_amount, p_reason);
end;
$$;

grant execute on function public.award_points_tx(integer, text) to authenticated;
