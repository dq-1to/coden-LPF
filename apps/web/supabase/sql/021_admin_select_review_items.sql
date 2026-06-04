-- 021_admin_select_review_items.sql
-- 品質ダッシュボード向け: 管理者が全ユーザーの review_items を横断集計できるようにする。

drop policy if exists admin_select_review_items on public.review_items;
create policy admin_select_review_items on public.review_items
  for select using (public.is_admin());
