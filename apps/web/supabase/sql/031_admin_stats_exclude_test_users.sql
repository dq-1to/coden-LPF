-- v6roadmap09 M11-4: admin統計テストアカウント除外（Issue #319）
-- Run this in Supabase SQL Editor (または supabase db push)
-- 前提: 030_profiles_is_test_user.sql が適用済み（profiles.is_test_user が存在する）
--
-- 構成:
--   1. admin_list_users        : 戻り値に is_test_user を追加（DROP AND CREATE）
--   2. admin_get_user_basic    : 戻り値に is_test_user を追加（DROP AND CREATE）
--   3. get_dau_last_30_days    : is_test_user = true のユーザーを除外（CREATE OR REPLACE）
--   4. get_step_completion_rates : 同上
--   5. get_top_missed_questions  : 同上
--   6. admin_get_global_stats_summary（新規）: adminStatsService.getGlobalStatsSummary
--      が現在フロントで直接集計している 4 値（総ユーザー数・総配布ポイント・
--      フィードバック累計・新規フィードバック件数）を、テストユーザーを除外して
--      1 RPC で返す
--
-- DROP AND CREATE を使う理由:
--   admin_list_users / admin_get_user_basic は返り値の TABLE 定義に列を追加する。
--   PostgreSQL の CREATE OR REPLACE FUNCTION は戻り値の型（列構成）を変更できず
--   "cannot change return type of existing function" エラーになるため、
--   本ファイルでは対象 2 関数を DROP してから CREATE する。
--   get_dau_last_30_days 等 3 関数は戻り値の列構成を変えず本文（WHERE 条件）のみ
--   変更するため、CREATE OR REPLACE で問題ない。

-- =========================================================================
-- 1. admin_list_users: is_test_user を追加
-- =========================================================================

drop function if exists public.admin_list_users();

create or replace function public.admin_list_users()
returns table (
  user_id         uuid,
  email           text,
  display_name    text,
  is_admin        boolean,
  is_test_user    boolean,
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
    p.is_test_user,
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

-- =========================================================================
-- 2. admin_get_user_basic: is_test_user を追加
-- =========================================================================

drop function if exists public.admin_get_user_basic(uuid);

create or replace function public.admin_get_user_basic(p_user_id uuid)
returns table (
  user_id      uuid,
  email        text,
  display_name text,
  is_admin     boolean,
  is_test_user boolean,
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
    coalesce(p.is_test_user, false) as is_test_user,
    p.created_at
  from public.profiles p
  left join auth.users au on au.id = p.id
  where p.id = p_user_id
    and public.is_admin()
  limit 1;
$$;

grant execute on function public.admin_get_user_basic(uuid) to authenticated;

-- =========================================================================
-- 3. get_dau_last_30_days: is_test_user = true のユーザーを除外
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
    join public.profiles p on p.id = ph.user_id
    where ph.created_at >= ((current_date at time zone 'Asia/Tokyo')::date - 29)
      and p.is_test_user = false
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
-- 4. get_step_completion_rates: is_test_user = true のユーザーを除外
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
  join public.profiles p on p.id = sp.user_id
  where p.is_test_user = false
  group by sp.step_id
  order by completion_rate asc, sp.step_id asc;
end;
$$;

grant execute on function public.get_step_completion_rates() to authenticated;

-- =========================================================================
-- 5. get_top_missed_questions: is_test_user = true のユーザーを除外
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
  join public.profiles p on p.id = cs.user_id
  where p.is_test_user = false
  group by cs.step_id
  having count(*) >= v_min
  order by failure_rate desc, attempt_count desc
  limit v_limit;
end;
$$;

grant execute on function public.get_top_missed_questions(integer, integer) to authenticated;

-- =========================================================================
-- 6. admin_get_global_stats_summary（新規）
--    adminStatsService.getGlobalStatsSummary が現在フロントで直接集計している
--    4 値を、is_test_user = true のユーザーを除外して 1 RPC で返す。
--
--    RPC化した理由（T4）:
--    - 既存実装は profiles / point_history / user_feedback の3テーブルを
--      フロントから並列 PostgREST クエリで集計しており、テストユーザー除外には
--      point_history / user_feedback 側から profiles.is_test_user を参照する
--      JOIN 相当のフィルタが必要になる
--    - PostgREST の埋め込みリソースフィルタ（例: point_history?select=amount,profiles!inner(is_test_user)）
--      は本プロジェクトに前例がなく、型生成（database.types.ts）にも反映されない
--      ため、動作保証と型安全性の面でリスクが残る
--    - 一方、014_admin_stats_rpc.sql と同型の SECURITY DEFINER RPC を1つ追加する
--      だけで、既存パターン（is_admin() ガード + plpgsql）を踏襲して確実に実装できる
--    - よって「最小差分で確実な方」として RPC 化を選択する
-- =========================================================================

create or replace function public.admin_get_global_stats_summary()
returns table (
  total_users               integer,
  total_points_distributed  integer,
  total_feedback            integer,
  new_feedback              integer
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
    (select count(*)::integer from public.profiles where is_test_user = false) as total_users,
    (
      select coalesce(sum(ph.amount), 0)::integer
      from public.point_history ph
      join public.profiles p on p.id = ph.user_id
      where p.is_test_user = false
    ) as total_points_distributed,
    (
      select count(*)::integer
      from public.user_feedback uf
      join public.profiles p on p.id = uf.user_id
      where p.is_test_user = false
    ) as total_feedback,
    (
      select count(*)::integer
      from public.user_feedback uf
      join public.profiles p on p.id = uf.user_id
      where p.is_test_user = false
        and uf.status = 'new'
    ) as new_feedback;
end;
$$;

grant execute on function public.admin_get_global_stats_summary() to authenticated;
