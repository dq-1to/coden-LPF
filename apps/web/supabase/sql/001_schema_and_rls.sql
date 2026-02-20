-- M1-1: Supabase schema setup
-- Run this in Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.step_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  step_id text not null,
  read_done boolean not null default false,
  practice_done boolean not null default false,
  test_done boolean not null default false,
  challenge_done boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, step_id)
);

create table if not exists public.challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  step_id text not null,
  code text not null,
  is_passed boolean not null default false,
  matched_keywords text[] not null default '{}',
  submitted_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.step_progress enable row level security;
alter table public.challenge_submissions enable row level security;

drop policy if exists own_profile on public.profiles;
create policy own_profile on public.profiles
  for all using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists own_progress on public.step_progress;
create policy own_progress on public.step_progress
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists own_challenge_submission on public.challenge_submissions;
create policy own_challenge_submission on public.challenge_submissions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
