ALTER TABLE account_addresses
  ADD COLUMN IF NOT EXISTS building_type text NOT NULL DEFAULT 'casa',
  ADD COLUMN IF NOT EXISTS house_number text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS floor text,
  ADD COLUMN IF NOT EXISTS apartment_unit text;
