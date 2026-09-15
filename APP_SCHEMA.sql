-- Server-tabellen (logboek, marktplaats, games) in hetzelfde Supabase-Postgres-project als het CMS.
-- Alternatief: `npm run db:push` met DATABASE_URL = Supabase connection string.
-- Veilig om te herhalen (IF NOT EXISTS).

create extension if not exists pgcrypto;

create table if not exists public.users (
  id varchar primary key default gen_random_uuid()::text,
  username text not null unique,
  password text not null,
  name text,
  role text not null default 'aso',
  pin text,
  created_at timestamptz default now()
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
