/*
# Add is_featured column to products table

1. Changes
- Adds `is_featured` boolean column to `products` table, defaulting to `false`.
- This column allows admin to mark products as "featured" on the home page.
2. Security
- No RLS policy changes. Existing policies on `products` remain unchanged.
3. Notes
- The column already exists in the application's ProductRow mapping; this migration
  ensures the database schema matches.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE products ADD COLUMN is_featured boolean NOT NULL DEFAULT false;
  END IF;
END $$;
