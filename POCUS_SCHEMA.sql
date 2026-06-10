-- POCUS table for Supabase CMS (3 markdown tabs).
-- Run in Supabase SQL Editor if needed.

create extension if not exists pgcrypto;

create table if not exists public.pocus (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content_indicaties text not null default '',
  content_techniek text not null default '',
  content_interpretatie text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pocus
  add column if not exists title text,
  add column if not exists content_indicaties text,
  add column if not exists content_techniek text,
  add column if not exists content_interpretatie text,
  add column if not exists updated_at timestamptz;

create or replace function public.set_pocus_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pocus_updated_at on public.pocus;
create trigger pocus_updated_at
before update on public.pocus
for each row
execute function public.set_pocus_updated_at();
