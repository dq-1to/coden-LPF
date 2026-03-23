-- 005: test001@test.dev の Step 1〜12 を完了済みにする
-- 用途: API Practice コース（Step 13〜20）の開放・動作確認
-- 実行先: Supabase ダッシュボード SQL Editor（本番環境）
--
-- 前提:
--   - test001@test.dev が auth.users に存在すること
--   - 001〜004 の SQL が適用済みであること

-- Step 1〜12 のステップ ID（courseData.ts 準拠）
-- Fundamentals: usestate-basic, events, conditional, lists
-- Intermediate: useeffect, forms, usecontext, usereducer
-- Advanced: custom-hooks, api-fetch, performance, testing

do $$
declare
  v_user_id uuid;
begin
  -- test001@test.dev の user_id を取得
  select id into v_user_id
  from auth.users
  where email = 'test001@test.dev';

  if v_user_id is null then
    raise exception 'User test001@test.dev not found in auth.users';
  end if;

  -- Step 1〜12 の進捗を全モード完了済みで UPSERT
  insert into public.step_progress (user_id, step_id, read_done, practice_done, test_done, challenge_done, completed_at, updated_at)
  values
    (v_user_id, 'usestate-basic', true, true, true, true, now(), now()),
    (v_user_id, 'events',         true, true, true, true, now(), now()),
    (v_user_id, 'conditional',    true, true, true, true, now(), now()),
    (v_user_id, 'lists',          true, true, true, true, now(), now()),
    (v_user_id, 'useeffect',      true, true, true, true, now(), now()),
    (v_user_id, 'forms',          true, true, true, true, now(), now()),
    (v_user_id, 'usecontext',     true, true, true, true, now(), now()),
    (v_user_id, 'usereducer',     true, true, true, true, now(), now()),
    (v_user_id, 'custom-hooks',   true, true, true, true, now(), now()),
    (v_user_id, 'api-fetch',      true, true, true, true, now(), now()),
    (v_user_id, 'performance',    true, true, true, true, now(), now()),
    (v_user_id, 'testing',        true, true, true, true, now(), now())
  on conflict (user_id, step_id) do update set
    read_done      = true,
    practice_done  = true,
    test_done      = true,
    challenge_done = true,
    completed_at   = now(),
    updated_at     = now();

  -- learning_stats を更新（ストリーク1日目 + 最終学習日 = 今日）
  insert into public.learning_stats (user_id, total_points, current_streak, max_streak, last_study_date, updated_at)
  values (v_user_id, 0, 1, 1, current_date, now())
  on conflict (user_id) do update set
    current_streak  = 1,
    max_streak      = greatest(public.learning_stats.max_streak, 1),
    last_study_date = current_date,
    updated_at      = now();

  raise notice 'Success: test001@test.dev (%) — 12 steps completed, API Practice unlocked', v_user_id;
end $$;
