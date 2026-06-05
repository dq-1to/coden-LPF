-- 025: E2E テスト用アカウントのシード
-- 用途: docs/usertest/Utest-e2e.md の自動化シナリオで使う固定アカウントを用意する。
--
-- 作成するアカウント（パスワードは共通: TestPass123!）:
--   - e2e-admin@coden.dev    … 管理者（profiles.is_admin = true）。S-ADMIN / AdminGuard 確認用
--   - e2e-complete@coden.dev … 全40ステップ完了済み。進捗ロック対象や最終ステップ挙動の確認用
--   - e2e-general@coden.dev  … 進捗ゼロの一般ユーザー。ロック挙動・通常フロー確認用
--
-- サインアップ通しフロー（PW-AUTH-06）のアカウントはここではシードしない。
--   spec 側で e2e+<timestamp>@coden.dev を一意生成し、afterAll で削除する運用とする。
--
-- 前提:
--   - 001〜024 の SQL が適用済みであること（profiles.is_admin は 013 で追加）
--   - email_change 系カラムは空文字を明示する（GoTrue 500 回避。002 と同方針）
--
-- 実行先（重要）:
--   ローカル or 専用テストプロジェクトで実行すること。
--   本番プロジェクトには投入しない（テスト用認証情報の混入を防ぐため）。

-- ─────────────────────────────────────────
-- 1-2. auth.users と profiles を用意
--   auth.users の email 一意制約は部分インデックス（is_sso_user = false）の
--   場合があり ON CONFLICT (email) が使えないため、email ごとに存在チェックして
--   insert / update する方式にする（制約に依存せず冪等）。
-- ─────────────────────────────────────────
do $$
declare
  v_emails text[] := array[
    'e2e-admin@coden.dev',
    'e2e-complete@coden.dev',
    'e2e-general@coden.dev'
  ];
  v_email text;
  v_id    uuid;
begin
  foreach v_email in array v_emails loop
    select id into v_id from auth.users where email = v_email;

    if v_id is null then
      v_id := gen_random_uuid();
      insert into auth.users (
        id, email, encrypted_password, email_confirmed_at,
        confirmation_token, recovery_token, email_change,
        email_change_token_new, email_change_token_current,
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
        is_super_admin, instance_id, aud, role
      )
      values (
        v_id, v_email, crypt('TestPass123!', gen_salt('bf', 10)), now(),
        '', '', '', '', '',
        now(), now(),
        '{"provider":"email","providers":["email"]}', '{}',
        false, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'
      );
    else
      update auth.users
      set encrypted_password = crypt('TestPass123!', gen_salt('bf', 10)),
          updated_at = now()
      where id = v_id;
    end if;

    -- profiles を UPSERT（id は PK。018 の自動作成トリガで先に行ができていても安全）
    insert into public.profiles (id, display_name, is_admin)
    values (v_id, split_part(v_email, '@', 1), v_email = 'e2e-admin@coden.dev')
    on conflict (id) do update set
      display_name = excluded.display_name,
      is_admin     = excluded.is_admin;
  end loop;
end $$;

-- ─────────────────────────────────────────
-- 3. e2e-complete@coden.dev を全40ステップ完了済みにする
-- ─────────────────────────────────────────
do $$
declare
  v_user_id uuid;
  v_step_ids text[] := array[
    -- React基礎 / 応用 / 上級 / API実践
    'usestate-basic','events','conditional','lists',
    'useeffect','forms','usecontext','usereducer',
    'custom-hooks','api-fetch','performance','testing',
    'api-counter-get','api-counter-post','api-tasks-list','api-tasks-create',
    'api-tasks-update','api-tasks-delete','api-custom-hook','api-error-loading',
    -- React モダン / 実務パターン
    'error-boundary','suspense-lazy','concurrent-features','use-optimistic','portals','forward-ref',
    'rhf-zod','pagination','infinite-scroll','auth-flow',
    -- TypeScript / TypeScript×React
    'ts-types','ts-functions','ts-objects','ts-union-narrowing','ts-generics','ts-utility-types',
    'ts-react-props','ts-react-state','ts-react-hooks','ts-react-events'
  ];
begin
  select id into v_user_id
  from auth.users
  where email = 'e2e-complete@coden.dev';

  if v_user_id is null then
    raise exception 'User e2e-complete@coden.dev not found in auth.users';
  end if;

  -- 全ステップを全モード完了で UPSERT
  insert into public.step_progress
    (user_id, step_id, read_done, practice_done, test_done, challenge_done, completed_at, updated_at)
  select v_user_id, unnest(v_step_ids), true, true, true, true, now(), now()
  on conflict (user_id, step_id) do update set
    read_done      = true,
    practice_done  = true,
    test_done      = true,
    challenge_done = true,
    completed_at   = now(),
    updated_at     = now();

  -- learning_stats（ストリーク1日目・最終学習日=今日）
  insert into public.learning_stats
    (user_id, total_points, current_streak, max_streak, last_study_date, updated_at)
  values (v_user_id, 0, 1, 1, current_date, now())
  on conflict (user_id) do update set
    current_streak  = 1,
    max_streak      = greatest(public.learning_stats.max_streak, 1),
    last_study_date = current_date,
    updated_at      = now();

  raise notice 'Success: e2e-complete@coden.dev (%) — % steps completed', v_user_id, array_length(v_step_ids, 1);
end $$;
