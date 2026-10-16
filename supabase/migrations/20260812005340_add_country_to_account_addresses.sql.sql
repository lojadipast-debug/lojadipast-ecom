/*
# Add country column to account_addresses

1. Modified Tables
- `account_addresses`: added `country` column (text, defaults to 'Portugal').
  Allows users to store the country for each delivery address.
2. Security
- No policy changes — the table already has owner-scoped RLS via `user_id`.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'account_addresses' AND column_name = 'country'
  ) THEN
    ALTER TABLE account_addresses ADD COLUMN country text NOT NULL DEFAULT 'Portugal';
  END IF;
END $$;
