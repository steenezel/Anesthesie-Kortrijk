-- Server-tabellen (logboek, marktplaats, games) in hetzelfde Supabase-Postgres-project als het CMS.
-- Alternatief: `npm run db:push` met DATABASE_URL = Supabase connection string.
-- Veilig om te herhalen (IF NOT EXISTS).

create extension if not exists pgcrypto;

create table if not exists public.users (
  id varchar primary key default gen_random_uuid()::text,
  username text not null unique,
  password text not null default '',
  name text,
  email text unique,
  role text not null default 'aso',
  pin text,
  active boolean not null default true,
  auth_user_id text unique,
  created_at timestamptz default now()
);

-- Auth / identity (Better Auth + app extras). Safe to re-run.
alter table public.users add column if not exists email text;
alter table public.users add column if not exists active boolean not null default true;
alter table public.users add column if not exists auth_user_id text;

create table if not exists public.invited_users (
  id varchar primary key default gen_random_uuid()::text,
  email text not null unique,
  name text not null,
  role text not null default 'staff',
  username text,
  active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public."user" (
  id text primary key,
  name text not null,
  email text not null unique,
  email_verified boolean not null default false,
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.session (
  id text primary key,
  expires_at timestamptz not null,
  token text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  user_id text not null references public."user"(id) on delete cascade
);

create table if not exists public.account (
  id text primary key,
  account_id text not null,
  provider_id text not null,
  user_id text not null references public."user"(id) on delete cascade,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scope text,
  password text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification (
  id text primary key,
  identifier text not null,
  value text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_preferences (
  user_id varchar primary key references public.users(id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.quiz_progress (
  id varchar primary key default gen_random_uuid()::text,
  user_id varchar not null references public.users(id) on delete cascade,
  question_id text not null,
  ease_factor real not null default 2.5,
  interval_days integer not null default 0,
  repetitions integer not null default 0,
  due_at timestamptz not null default now(),
  last_result text,
  updated_at timestamptz default now()
);

create table if not exists public.logbook_entries (
  id varchar primary key default gen_random_uuid()::text,
  user_id varchar not null references public.users(id),
  category text not null,
  sub_category text not null,
  technique text not null,
  status text not null,
  date text not null,
  supervision_level text,
  supervisor_name text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.marketplace (
  id varchar primary key default gen_random_uuid()::text,
  "providerName" text not null,
  date text not null,
  "createdAt" text default CURRENT_TIMESTAMP::text
);

create table if not exists public.spinal_logs (
  id serial primary key,
  asl_or_anesthetist_name text not null,
  patient_identifier text not null,
  agent_used text not null default 'Scandicaine',
  dose_administered real not null,
  time_to_surgery_start integer not null,
  surgical_success boolean not null,
  failure_insufficient_duration boolean not null default false,
  failure_insufficient_motor boolean not null default false,
  failure_insufficient_sensory boolean not null default false,
  pacu_stay_duration integer not null,
  urinary_retention boolean not null,
  opioids_needed_pacu boolean not null,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.game_highscores (
  name text primary key,
  score integer not null,
  updated_at timestamptz default now()
);

create table if not exists public.game_stats (
  key text primary key,
  value integer not null default 0
);

insert into public.game_stats (key, value)
values ('global_bird_attempts', 0)
on conflict (key) do nothing;
