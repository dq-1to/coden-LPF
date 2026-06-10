-- 026_feedback_update_restriction.sql
-- Issue: #293
--
-- 脆弱性: 019 で追加した user_feedback_update_own_images ポリシー（for update,
-- 本人行）は列を制限できないため、本人が自分のフィードバックの status /
-- admin_note も書き換え可能だった（admin 運用の整合性が崩れる）。
--
-- 修正（案B）: 本人の直接 UPDATE ポリシーを削除し、image_paths の書き込みを
-- SECURITY DEFINER RPC に置換する。RPC 側でパス形式（自分の Storage ディレクトリ
-- 配下のみ・最大3枚・文字列配列）を検証するため、019 当時より制約が強くなる。
-- admin の status / admin_note 更新は既存の user_feedback_update_admin
-- ポリシー（admin のみ）のまま変更しない。

-- =========================================================================
-- 1. 本人の直接 UPDATE ポリシーを削除
--    これにより一般ユーザーの user_feedback UPDATE 経路は RPC のみになる。
-- =========================================================================

drop policy if exists "user_feedback_update_own_images" on public.user_feedback;

-- =========================================================================
-- 2. update_own_feedback_images RPC
--    本人のフィードバックの image_paths のみを更新する。
-- =========================================================================

create or replace function public.update_own_feedback_images(
  p_feedback_id uuid,
  p_image_paths jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_elem    jsonb;
  v_updated integer;
begin
  -- 認証チェック
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 入力バリデーション
  if p_feedback_id is null then
    raise exception 'feedback_id is required';
  end if;
  if p_image_paths is null or jsonb_typeof(p_image_paths) <> 'array' then
    raise exception 'image_paths must be a json array';
  end if;
  if jsonb_array_length(p_image_paths) > 3 then
    raise exception 'image_paths exceeds max count (3)';
  end if;

  -- 各要素は文字列で、自分の Storage ディレクトリ（{user_id}/...）配下のみ許可
  for v_elem in select * from jsonb_array_elements(p_image_paths)
  loop
    if jsonb_typeof(v_elem) <> 'string' then
      raise exception 'image_paths must contain only strings';
    end if;
    if (v_elem #>> '{}') not like (v_user_id::text || '/%') then
      raise exception 'image path must be under own directory';
    end if;
  end loop;

  -- 本人の行のみ更新（他人の feedback_id を渡しても 0 行更新で拒否）
  update public.user_feedback
    set image_paths = p_image_paths
    where id = p_feedback_id
      and user_id = v_user_id;

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'feedback not found';
  end if;
end;
$$;

grant execute on function public.update_own_feedback_images(uuid, jsonb) to authenticated;
