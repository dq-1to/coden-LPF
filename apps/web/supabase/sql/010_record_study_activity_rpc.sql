-- record_study_activity RPC: ストリーク更新をアトミックに実行
-- Read-Modify-Write のレースコンディションを FOR UPDATE 行ロックで防止

create or replace function record_study_activity()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today text;
  v_yesterday text;
  v_row learning_stats%rowtype;
  v_new_streak int;
  v_new_max int;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  v_today := to_char(now() at time zone 'UTC', 'YYYY-MM-DD');
  v_yesterday := to_char((now() at time zone 'UTC') - interval '1 day', 'YYYY-MM-DD');

  -- 行ロック付きで取得（存在しない場合は INSERT してから再取得）
  select * into v_row
    from learning_stats
    where user_id = v_user_id
    for update;

  if not found then
    insert into learning_stats (user_id, total_points, current_streak, max_streak, last_study_date)
      values (v_user_id, 0, 1, 1, v_today)
      on conflict (user_id) do nothing;
    return;
  end if;

  -- 今日既に記録済みならスキップ
  if v_row.last_study_date = v_today then
    return;
  end if;

  -- ストリーク計算
  if v_row.last_study_date = v_yesterday then
    v_new_streak := v_row.current_streak + 1;
  else
    v_new_streak := 1;
  end if;

  v_new_max := greatest(v_row.max_streak, v_new_streak);

  update learning_stats
    set current_streak = v_new_streak,
        max_streak = v_new_max,
        last_study_date = v_today,
        updated_at = now()
    where user_id = v_user_id;
end;
$$;

grant execute on function record_study_activity() to authenticated;
