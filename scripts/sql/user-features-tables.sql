-- Run on Preview/Production Postgres (Supabase) if drizzle-kit push is unavailable.
-- Mirrors APP_SCHEMA.sql additions for user features.

create table if not exists public.user_bookmarks (
  id varchar primary key default gen_random_uuid()::text,
  user_id varchar not null references public.users(id) on delete cascade,
  item_type text not null,
  item_id text not null,
  created_at timestamptz default now(),
  constraint user_bookmarks_user_item_uniq unique (user_id, item_type, item_id)
);

create table if not exists public.user_notes (
  id varchar primary key default gen_random_uuid()::text,
  user_id varchar not null references public.users(id) on delete cascade,
  target_type text not null,
  target_id text not null default '',
  content text not null default '',
  updated_at timestamptz default now(),
  constraint user_notes_user_target_uniq unique (user_id, target_type, target_id)
);

create table if not exists public.content_audit_logs (
  id varchar primary key default gen_random_uuid()::text,
  user_id varchar not null references public.users(id) on delete cascade,
  user_kortenaam text not null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  details jsonb,
  created_at timestamptz default now()
);

create index if not exists content_audit_logs_resource_idx
  on public.content_audit_logs (resource_type, resource_id, created_at desc);
