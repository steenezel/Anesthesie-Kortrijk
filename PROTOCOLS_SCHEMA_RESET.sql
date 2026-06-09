-- Supabase SQL script for a Markdown-only protocols CMS.
-- Run this in the Supabase SQL editor.

begin;

-- UUID generation helper (needed for id default)
create extension if not exists pgcrypto;

-- 1) Ensure table exists with required baseline columns.
create table if not exists public.protocols (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  discipline text not null default 'Algemeen',
  updated_at timestamptz not null default now()
);

-- 2) Normalize schema to expected shape (safe if columns already exist).
alter table public.protocols
  add column if not exists title text,
  add column if not exists content text,
  add column if not exists discipline text,
  add column if not exists updated_at timestamptz;

alter table public.protocols
  alter column title set not null,
  alter column content set not null,
  alter column discipline set not null,
  alter column updated_at set not null;

alter table public.protocols
  alter column content set default '',
  alter column discipline set default 'Algemeen',
  alter column updated_at set default now();

-- 3) Keep updated_at fresh on every update.
create or replace function public.set_protocols_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_protocols_updated_at on public.protocols;
create trigger trg_protocols_updated_at
before update on public.protocols
for each row
execute function public.set_protocols_updated_at();

-- 4) Delete existing rows that clearly contain HTML tags.
-- This keeps Markdown rows and removes "HTML polluted" rows.
delete from public.protocols
where content ~* '<\\/?[a-z][^>]*>';

-- Optional hard reset (use only if you want to wipe ALL rows):
-- truncate table public.protocols;

commit;
