-- M1-1: award_points_tx RPC
-- learning_stats UPSERT + point_history INSERT を1トランザクションで実行する。
-- Supabase SQL Editor で実行する。

create or replace function public.award_points_tx(
  p_user_id uuid,
  p_amount   integer,
  p_reason   text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- total_points をアトミックに加算（行が存在しなければ INSERT）
  insert into public.learning_stats (user_id, total_points, updated_at)
  values (p_user_id, p_amount, now())
  on conflict (user_id) do update
    set total_points = public.learning_stats.total_points + excluded.total_points,
        updated_at   = now();

  -- ポイント履歴を記録
  insert into public.point_history (user_id, amount, reason)
  values (p_user_id, p_amount, p_reason);
end;
$$;

-- authenticated ロールに実行権限を付与
grant execute on function public.award_points_tx(uuid, integer, text) to authenticated;
