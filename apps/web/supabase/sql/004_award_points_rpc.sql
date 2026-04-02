-- M1-1: award_points_tx RPC
-- learning_stats UPSERT + point_history INSERT を1トランザクションで実行する。
-- Supabase SQL Editor で実行する。
--
-- セキュリティ修正（v2roadmap03 2-2）:
-- - p_user_id を削除し auth.uid() でログインユーザーを特定（権限昇格防止）
-- - p_amount > 0 チェックで負の値を拒否

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

-- authenticated ロールに実行権限を付与
grant execute on function public.award_points_tx(integer, text) to authenticated;
