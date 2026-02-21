-- M4-1: Gamification Database Schema
-- Run this in Supabase SQL Editor

create table if not exists public.learning_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_points integer not null default 0,
  current_streak integer not null default 0,
  max_streak integer not null default 0,
  last_study_date date,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create table if not exists public.point_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.learning_stats enable row level security;
alter table public.achievements enable row level security;
alter table public.point_history enable row level security;

-- Policies for learning_stats
drop policy if exists own_learning_stats on public.learning_stats;
create policy own_learning_stats on public.learning_stats
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies for achievements
drop policy if exists own_achievements on public.achievements;
create policy own_achievements on public.achievements
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies for point_history
drop policy if exists own_point_history on public.point_history;
create policy own_point_history on public.point_history
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
