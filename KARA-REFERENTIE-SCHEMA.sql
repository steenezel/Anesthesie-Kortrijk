-- KARA Referentie — Supabase schema (fase 3+)
-- Run in Supabase SQL Editor when migrating from TypeScript config to CMS.
-- Safe to re-run: uses IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS public.reference_structures (
  id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN (
    'dermatome', 'plexus', 'nerve', 'root', 'trunk', 'division', 'cord', 'branch'
  )),
  label text NOT NULL,
  label_full text,
  parent_id text REFERENCES public.reference_structures(id) ON DELETE SET NULL,
  origin text,
  course text,
  sensory text,
  motor text,
  clinical_deficit text,
  notes text,
  related_ids text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reference_map_views (
  id text PRIMARY KEY,
  module text NOT NULL,
  label text NOT NULL,
  image_src text NOT NULL,
  image_width int,
  image_height int,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.reference_hotspots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id text NOT NULL REFERENCES public.reference_structures(id) ON DELETE CASCADE,
  map_view_id text NOT NULL REFERENCES public.reference_map_views(id) ON DELETE CASCADE,
  shape text NOT NULL CHECK (shape IN ('circle', 'polygon', 'svg-path')),
  geometry jsonb NOT NULL,
  UNIQUE (structure_id, map_view_id)
);

CREATE TABLE IF NOT EXISTS public.reference_block_links (
  structure_id text NOT NULL REFERENCES public.reference_structures(id) ON DELETE CASCADE,
  block_id uuid NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,
  PRIMARY KEY (structure_id, block_id)
);

CREATE INDEX IF NOT EXISTS idx_reference_structures_kind ON public.reference_structures(kind);
CREATE INDEX IF NOT EXISTS idx_reference_structures_parent ON public.reference_structures(parent_id);
CREATE INDEX IF NOT EXISTS idx_reference_hotspots_view ON public.reference_hotspots(map_view_id);

COMMENT ON TABLE public.reference_structures IS 'KARA Referentie: zenuwen, dermatomen, plexus-structuren';
COMMENT ON TABLE public.reference_map_views IS 'Interactieve kaart-views (dermatomen front, plexus brachiaal, ...)';
COMMENT ON TABLE public.reference_hotspots IS 'Klikzones op kaart-views, geometry: {x,y,r} | {points} | {svg_path_id}';
COMMENT ON TABLE public.reference_block_links IS 'Koppeling referentie-structuur ↔ LRA-block';
