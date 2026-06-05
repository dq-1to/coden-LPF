-- v5roadmap06 M3: feedback-created admin notification trigger
-- Run this in Supabase SQL Editor (または supabase db push)
-- 目的:
--   学習者が user_feedback を作成したとき、admin 宛ての notifications を自動作成する。
--   通知本文にはフィードバック本文を含めず、詳細画面への導線だけを持たせる。

create or replace function public.create_feedback_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    type,
    title,
    body,
    target_role,
    created_by
  )
  values (
    'feedback',
    '新しいフィードバックが届きました',
    'ユーザーから新しいフィードバックが届きました。管理画面で詳細を確認してください: /admin/feedback/' || new.id,
    'admin',
    null
  );

  return new;
end;
$$;

drop trigger if exists trg_user_feedback_create_notification on public.user_feedback;
create trigger trg_user_feedback_create_notification
  after insert on public.user_feedback
  for each row execute function public.create_feedback_notification();
