/*
# Product variation columns (sizes & colors)

1. Modified tables
   - `products`
       Adds four new columns so each product can independently opt in/out of
       size and color variations, and store the actual option lists:

       - `has_sizes` (boolean, default true) — when false, the storefront
         product page hides the size selector entirely.
       - `has_colors` (boolean, default true) — when false, the storefront
         product page hides the color selector entirely.
       - `sizes` (jsonb, default '[]') — array of size strings, e.g.
         ["S","M","L"] or ["2A","4A","6A"]. Only meaningful when has_sizes is
         true.
       - `colors` (jsonb, default '[]') — array of color objects with
         { name, hex }, e.g. [{"name":"Lilás pastel","hex":"#d7c6f2"}]. Only
         meaningful when has_colors is true.

   All columns are nullable-safe with defaults so existing rows remain valid
   and default to showing variations (backward compatible with current
   storefront behavior).

2. Security
   - No RLS policy changes. The existing admin-only INSERT/UPDATE/DELETE
     policies (scoped to raw_app_meta_data role = 'admin') already cover
     these new columns. The anon SELECT policy also covers them
     automatically since it grants read on all columns of the table.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS has_sizes boolean NOT NULL DEFAULT true;
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS has_colors boolean NOT NULL DEFAULT true;
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sizes jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS colors jsonb NOT NULL DEFAULT '[]'::jsonb;
