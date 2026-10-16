/*
# Add stock, promotions, subcategory, and order management fields

## Summary
This migration adds inventory control, advanced promotions, subcategories, and
order management capabilities to the Dipa store.

## Changes to `products` table:
1. `stock_quantity` (integer, default 0) — numeric stock count. When <= 0, product is "Esgotado".
2. `subcategory` (text, nullable) — sub-classification within the main category.
3. `promo_active` (boolean, default false) — master toggle for promotions.
4. `promo_original_price` (numeric, nullable) — original price before discount.
5. `promo_price` (numeric, nullable) — promotional price.
6. `promo_start_date` (timestamptz, nullable) — when promotion becomes active.
7. `promo_end_date` (timestamptz, nullable) — when promotion expires.
   If both start and end are NULL, the promotion runs indefinitely.

## Changes to `orders` table:
1. `order_number` (text, unique) — short human-readable order code like #DIPA-8492.
2. `nif` (text, nullable) — optional Portuguese tax ID (NIF).
3. `customer_phone`, `customer_address`, `customer_postal_code`, `customer_city` — customer fields.
4. Status CHECK constraint restricting to: pending, paid, preparing, shipped, delivered, cancelled.
   Existing rows are migrated: "Processamento" -> "preparing", "Aguarda pagamento" -> "pending".

## Security
- No RLS policy changes. Existing policies remain in effect.
- All new columns are nullable or have safe defaults.
*/

-- Products table: add stock_quantity
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0;

-- Products table: add subcategory
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS subcategory text;

-- Products table: add promotion fields
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS promo_active boolean NOT NULL DEFAULT false;
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS promo_original_price numeric(10,2);
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS promo_price numeric(10,2);
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS promo_start_date timestamptz;
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS promo_end_date timestamptz;

-- Orders table: add order_number
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_number text;

-- Orders table: add NIF
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS nif text;

-- Orders table: add customer fields
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_address text;
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_postal_code text;
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_city text;

-- Migrate existing order statuses to new values
UPDATE orders SET status = 'pending' WHERE status = 'Aguarda pagamento';
UPDATE orders SET status = 'preparing' WHERE status = 'Processamento';

-- Orders: add unique constraint on order_number (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_order_number_key'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
  END IF;
END $$;

-- Orders: add CHECK constraint on status (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_status_check
      CHECK (status IN ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'));
  END IF;
END $$;

-- Backfill: set order_number for existing orders that don't have one
UPDATE orders
  SET order_number = 'DIPA-' || lpad(floor(random() * 10000)::text, 4, '0')
  WHERE order_number IS NULL;

-- Backfill: set stock_quantity for existing products based on stock_status
UPDATE products
  SET stock_quantity = CASE
    WHEN stock_status = 'Sem stock' THEN 0
    ELSE 10
  END
  WHERE stock_quantity = 0 AND stock_status != 'Sem stock';
