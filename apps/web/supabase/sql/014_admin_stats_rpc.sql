-- v4roadmap02 M3: 管理者向け閲覧ポリシー + 統計 RPC + ユーザー一覧 RPC
-- Run this in Supabase SQL Editor (または supabase db push)
--
-- 構成:
--   1. admin 向け SELECT ポリシー（各進捗・ポイント系テーブル）
--   2. 統計 RPC
--      - get_dau_last_30_days
--      - get_step_completion_rates
--      - get_top_missed_questions
--   3. admin_list_users RPC（auth.users.email を含めるため SECURITY DEFINER）
--
-- セキュリティ:
--   - RPC は全て SECURITY DEFINER + set search_path = public
--   - 先頭で public.is_admin() を確認し、非 admin からの呼び出しを拒否する
--   - RLS ポリシーは public.is_admin() で保護（既存 own_* ポリシーはそのまま残す）

-- =========================================================================
-- 1. 管理者閲覧用 RLS ポリシー
--    既存の own_* ポリシー (auth.uid() = user_id) に加えて
--    admin は横断的に SELECT できるポリシーを追加する。
--    UPDATE/INSERT/DELETE は own_* のままで、admin からの書き込みは
--    SECURITY DEFINER RPC (015_admin_ops_rpc.sql) 経由に限定する。
-- =========================================================================

drop policy if exists admin_select_profiles on public.profiles;
create policy admin_select_profiles on public.profiles
  for select using (public.is_admin());

drop policy if exists admin_select_step_progress on public.step_progress;
create policy admin_select_step_progress on public.step_progress
  for select using (public.is_admin());

drop policy if exists admin_select_challenge_submissions on public.challenge_submissions;
create policy admin_select_challenge_submissions on public.challenge_submissions
  for select using (public.is_admin());

drop policy if exists admin_select_learning_stats on public.learning_stats;
create policy admin_select_learning_stats on public.learning_stats
  for select using (public.is_admin());

drop policy if exists admin_select_achievements on public.achievements;
create policy admin_select_achievements on public.achievements
  for select using (public.is_admin());

drop policy if exists admin_select_point_history on public.point_history;
create policy admin_select_point_history on public.point_history
  for select using (public.is_admin());

drop policy if exists admin_select_daily_challenge_history on public.daily_challenge_history;
create policy admin_select_daily_challenge_history on public.daily_challenge_history
  for select using (public.is_admin());

drop policy if exists admin_select_code_doctor_progress on public.code_doctor_progress;
create policy admin_select_code_doctor_progress on public.code_doctor_progress
  for select using (public.is_admin());

drop policy if exists admin_select_mini_project_progress on public.mini_project_progress;
create policy admin_select_mini_project_progress on public.mini_project_progress
  for select using (public.is_admin());

drop policy if exists admin_select_code_reading_progress on public.code_reading_progress;
create policy admin_select_code_reading_progress on public.code_reading_progress
  for select using (public.is_admin());

drop policy if exists admin_select_base_nook_progress on public.base_nook_progress;
create policy admin_select_base_nook_progress on public.base_nook_progress
  for select using (public.is_admin());

-- =========================================================================
-- 2-1. get_dau_last_30_days
--      過去 30 日の DAU（日次アクティブユーザー）を返す。
--      point_history を「ポイントを獲得する操作 = 学習アクティビティ」と定義。
--      ポイント付与は各 mode（read/practice/test/challenge 等）で実行されるため
--      これを集計することでアクティビティの重複なく集計できる。
--      日付境界は JST ベース（Asia/Tokyo）で評価する。
-- =========================================================================

create or replace function public.get_dau_last_30_days()
returns table (
  activity_date date,
  active_users  integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  return query
  with day_series as (
    select (generate_series(
      (current_date at time zone 'Asia/Tokyo')::date - 29,
      (current_date at time zone 'Asia/Tokyo')::date,
      interval '1 day'
    ))::date as d
  ),
  per_day as (
    select
      (ph.created_at at time zone 'Asia/Tokyo')::date as d,
      count(distinct ph.user_id) as n
    from public.point_history ph
    where ph.created_at >= ((current_date at time zone 'Asia/Tokyo')::date - 29)
    group by 1
  )
  select
    ds.d as activity_date,
    coalesce(pd.n, 0)::integer as active_users
  from day_series ds
  left join per_day pd on pd.d = ds.d
  order by ds.d asc;
end;
$$;

grant execute on function public.get_dau_last_30_days() to authenticated;

-- =========================================================================
-- 2-2. get_step_completion_rates
--      step_progress を集計して step_id ごとの完了率を返す。
--      total_users = 少なくとも 1 つでも進捗レコードを持つユーザー数
--      （未着手ユーザーを分母に含めないため、進捗を始めたユーザー中の完了率になる）
--      completion は step_progress.completed_at が NULL でない = 4 モード全完了。
-- =========================================================================

create or replace function public.get_step_completion_rates()
returns table (
  step_id          text,
  total_users      integer,
  completed_users  integer,
  completion_rate  numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  return query
  select
    sp.step_id,
    count(distinct sp.user_id)::integer as total_users,
    count(distinct sp.user_id) filter (where sp.completed_at is not null)::integer as completed_users,
    case
      when count(distinct sp.user_id) = 0 then 0::numeric
      else round(
        (count(distinct sp.user_id) filter (where sp.completed_at is not null))::numeric
          / count(distinct sp.user_id)::numeric,
        4
      )
    end as completion_rate
  from public.step_progress sp
  group by sp.step_id
  order by completion_rate asc, sp.step_id asc;
end;
$$;

grant execute on function public.get_step_completion_rates() to authenticated;

-- =========================================================================
-- 2-3. get_top_missed_questions
--      challenge_submissions を集計して、失敗率が高い step_id TOP N を返す。
--      失敗率 = 不正解回数 / 試行回数
--      試行回数が少なすぎる step は除外（min_attempts 未満）。
--      JSON に列名を持たせるため named return table を使う。
-- =========================================================================

create or replace function public.get_top_missed_questions(
  p_limit integer default 10,
  p_min_attempts integer default 3
)
returns table (
  step_id        text,
  attempt_count  integer,
  failure_count  integer,
  failure_rate   numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_limit integer;
  v_min   integer;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  -- clamp inputs
  v_limit := greatest(1, least(coalesce(p_limit, 10), 100));
  v_min   := greatest(1, coalesce(p_min_attempts, 3));

  return query
  select
    cs.step_id,
    count(*)::integer as attempt_count,
    count(*) filter (where cs.is_passed = false)::integer as failure_count,
    round(
      (count(*) filter (where cs.is_passed = false))::numeric
        / count(*)::numeric,
      4
    ) as failure_rate
  from public.challenge_submissions cs
  group by cs.step_id
  having count(*) >= v_min
  order by failure_rate desc, attempt_count desc
  limit v_limit;
end;
$$;

grant execute on function public.get_top_missed_questions(integer, integer) to authenticated;

-- =========================================================================
-- 3. admin_list_users
--    ユーザー一覧（email を含む）を返す。
--    auth.users は authenticated ロールから直接 SELECT できないため、
--    SECURITY DEFINER で join して返す。badge_count も同時集計。
-- =========================================================================

create or replace function public.admin_list_users()
returns table (
  user_id         uuid,
  email           text,
  display_name    text,
  is_admin        boolean,
  total_points    integer,
  current_streak  integer,
  max_streak      integer,
  last_study_date date,
  badge_count     integer,
  created_at      timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  return query
  select
    p.id as user_id,
    au.email::text as email,
    p.display_name,
    p.is_admin,
    coalesce(ls.total_points, 0)::integer as total_points,
    coalesce(ls.current_streak, 0)::integer as current_streak,
    coalesce(ls.max_streak, 0)::integer as max_streak,
    ls.last_study_date,
    coalesce(bc.cnt, 0)::integer as badge_count,
    p.created_at
  from public.profiles p
  left join auth.users au on au.id = p.id
  left join public.learning_stats ls on ls.user_id = p.id
  left join (
    select a.user_id, count(*)::integer as cnt
    from public.achievements a
    group by a.user_id
  ) bc on bc.user_id = p.id
  order by ls.total_points desc nulls last, p.created_at desc;
end;
$$;

grant execute on function public.admin_list_users() to authenticated;
