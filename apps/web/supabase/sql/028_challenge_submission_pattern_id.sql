-- v6roadmap02 M5-2: Challenge submissions patternId lightweight support
-- Run this after 001_schema_and_rls.sql.

alter table public.challenge_submissions
  add column if not exists pattern_id text;

create index if not exists challenge_submissions_user_step_pattern_submitted_idx
  on public.challenge_submissions (user_id, step_id, pattern_id, submitted_at desc);
