-- Run in Supabase SQL Editor to enable body-region tagging for the LRA atlas.
-- Safe to re-run: uses IF NOT EXISTS.

ALTER TABLE public.blocks
  ADD COLUMN IF NOT EXISTS body_regions text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.blocks.body_regions IS
  'Atlas body parts: head-neck, upper-extremity, thorax, abdomen, back, lower-extremity';

-- Example: tag an existing block (replace UUID with your block id)
-- UPDATE public.blocks
-- SET body_regions = ARRAY['head-neck', 'upper-extremity']
-- WHERE title ILIKE '%ISB%';
