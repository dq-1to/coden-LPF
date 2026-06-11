-- v1.0 post-release: add completion event types for practice modes
-- Run this in Supabase SQL Editor after 022_learning_events.sql.

alter table public.learning_events
  drop constraint if exists learning_events_event_type_check;

alter table public.learning_events
  add constraint learning_events_event_type_check check (
    event_type in (
      'step_started',
      'mode_started',
      'mode_completed',
      'practice_answer_submitted',
      'test_submitted',
      'challenge_submitted',
      'daily_completed',
      'code_doctor_completed',
      'code_reading_completed',
      'review_item_created',
      'review_item_resolved',
      'mini_project_started',
      'mini_project_completed',
      'feedback_created',
      'base_nook_opened'
    )
  );
