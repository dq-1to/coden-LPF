-- v5roadmap05 M2: learning_events event log foundation
-- Run this in Supabase SQL Editor (または supabase db push)
-- 目的:
--   学習導線の遷移率・離脱率・誤答率を admin が集計できるよう、
--   Read / Practice / Test / Challenge の主要行動をイベントとして保存する。

create table if not exists public.learning_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  step_id text,
  mode text,
  course_id text,
  payload jsonb,
  created_at timestamptz not null default now(),
  constraint learning_events_event_type_check check (
    event_type in (
      'step_started',
      'mode_started',
      'mode_completed',
      'practice_answer_submitted',
      'test_submitted',
      'challenge_submitted',
      'daily_completed',
      'review_item_created',
      'review_item_resolved',
      'mini_project_started',
      'mini_project_completed',
      'feedback_created',
      'base_nook_opened'
    )
  ),
  constraint learning_events_mode_check check (
    mode is null or mode in ('read', 'practice', 'test', 'challenge', 'daily', 'base_nook', 'mini_project')
  )
);

alter table public.learning_events enable row level security;

drop policy if exists insert_own_learning_events on public.learning_events;
create policy insert_own_learning_events on public.learning_events
  for insert
  with check (auth.uid() = user_id);

drop policy if exists admin_select_learning_events on public.learning_events;
create policy admin_select_learning_events on public.learning_events
  for select
  using (public.is_admin());

create index if not exists learning_events_event_type_created_at_idx
  on public.learning_events (event_type, created_at desc);

create index if not exists learning_events_step_id_event_type_idx
  on public.learning_events (step_id, event_type)
  where step_id is not null;

create index if not exists learning_events_user_id_created_at_idx
  on public.learning_events (user_id, created_at desc);

create index if not exists learning_events_course_id_created_at_idx
  on public.learning_events (course_id, created_at desc)
  where course_id is not null;
