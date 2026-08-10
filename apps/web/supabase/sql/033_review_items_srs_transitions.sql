-- 033_review_items_srs_transitions.sql
-- 032 で追加した SRS カラムの「書き込み規則」を DB 側へ移す。
--
-- 背景:
--   正解時の stage 進行をブラウザ側の SELECT → 計算 → UPDATE で行うと、
--   (1) 同じ正解送信を連打するだけで期日前でも stage 4 まで進められる
--   (2) 端末時刻に依存する
--   の 2 点で間隔反復が成立しない。
--   そのため「期日到来済みのときだけ 1 段階進める」処理を行ロック付き RPC に閉じ込め、
--   期日判定は必ず DB の now() で行う。
--
-- ここで追加する RPC:
--   1. advance_review_item_if_due   -- 正解時: 期日到来済みなら 1 段階だけ進める
--   2. reset_review_item_schedule   -- 再誤答時: スケジュールだけを stage 0 / 即日 due に戻す
--
-- 権限方針:
--   - どちらも security definer + set search_path = public
--   - user_id は引数で受け取らず auth.uid() で確定する（他ユーザーの行は指定不可）
--   - execute は authenticated のみ（public / anon からは revoke）

-- ────────────────────────────────────────────────────────────
-- 1. advance_review_item_if_due
--    正解時の段階進行。stage 0→1（翌日）→2（3日後）→3（7日後）→4（resolved）。
--    対象なし / resolved / 期日前 / stage 4 到達済みの場合は何も更新せず false を返す。
-- ────────────────────────────────────────────────────────────

create or replace function public.advance_review_item_if_due(
  p_step_id text,
  p_mode text,
  p_question_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row review_items%rowtype;
  v_next_stage smallint;
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 同時実行で同じ item が二重に進むのを防ぐため、対象行をロックしてから判定する。
  -- question_id は NULL 可のため is not distinct from で比較する。
  select * into v_row
    from review_items
    where user_id = v_user_id
      and step_id = p_step_id
      and mode = p_mode
      and question_id is not distinct from p_question_id
    for update;

  if not found then
    return false;
  end if;

  if v_row.status <> 'open' then
    return false;
  end if;

  -- 期日判定は必ず DB 時刻で行う（端末時刻を信用しない）。
  if v_row.next_review_at > v_now then
    return false;
  end if;

  if v_row.review_stage >= 4 then
    return false;
  end if;

  v_next_stage := (v_row.review_stage + 1)::smallint;

  update review_items
    set review_stage = v_next_stage,
        status = case when v_next_stage >= 4 then 'resolved' else 'open' end,
        next_review_at = case v_next_stage
          when 1 then v_now + interval '1 day'
          when 2 then v_now + interval '3 days'
          when 3 then v_now + interval '7 days'
          else next_review_at
        end,
        last_reviewed_at = v_now,
        resolved_at = case when v_next_stage >= 4 then v_now else null end
    where id = v_row.id;

  return true;
end;
$$;

comment on function public.advance_review_item_if_due(text, text, text)
  IS '正解時のSRS段階進行。auth.uid() 本人かつ期日到来済みの open item だけを1段階進める。更新したら true。';

revoke execute on function public.advance_review_item_if_due(text, text, text) from public;
revoke execute on function public.advance_review_item_if_due(text, text, text) from anon;
grant execute on function public.advance_review_item_if_due(text, text, text) to authenticated;

-- ────────────────────────────────────────────────────────────
-- 2. reset_review_item_schedule
--    再誤答時に「スケジュールだけ」を stage 0 / 即日 due に戻す。
--    expected / user_input / step_id / mode / question_id は変更しない。
--    Daily で出題された Practice/Test 由来 item を戻す用途で使う。
-- ────────────────────────────────────────────────────────────

create or replace function public.reset_review_item_schedule(
  p_step_id text,
  p_mode text,
  p_question_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_updated integer;
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  update review_items
    set status = 'open',
        review_stage = 0,
        next_review_at = v_now,
        last_reviewed_at = v_now,
        resolved_at = null
    where user_id = v_user_id
      and step_id = p_step_id
      and mode = p_mode
      and question_id is not distinct from p_question_id;

  get diagnostics v_updated = row_count;

  return v_updated > 0;
end;
$$;

comment on function public.reset_review_item_schedule(text, text, text)
  IS '再誤答時のSRSリセット。auth.uid() 本人の item のスケジュールだけを stage 0 / 即日 due に戻す。更新したら true。';

revoke execute on function public.reset_review_item_schedule(text, text, text) from public;
revoke execute on function public.reset_review_item_schedule(text, text, text) from anon;
grant execute on function public.reset_review_item_schedule(text, text, text) to authenticated;
