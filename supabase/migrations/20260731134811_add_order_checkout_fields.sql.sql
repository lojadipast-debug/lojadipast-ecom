/*
# Add checkout detail columns to orders

1. Modified tables
  - `orders`
      Adds columns the checkout form now collects so each order record is
      complete and queryable:
        phone          text          — customer phone number
        address        text          — street address line
        city           text          — city
        postal_code    text          — postal code
        shipping_method text         — 'standard' | 'express'
        payment_method  text         — 'card' | 'mbway' | 'paypal'
        coupon_code     text         — optional discount code applied
        discount_amount numeric(10,2) DEFAULT 0 — discount value applied
        shipping_cost   numeric(10,2) DEFAULT 0 — shipping cost charged

  All new columns are nullable / have defaults so existing order rows remain
  valid. No data is lost; no types changed; no tables renamed.

2. Security
  - RLS policies unchanged. orders remains anon+authenticated INSERT + SELECT.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS phone           text,
  ADD COLUMN IF NOT EXISTS address         text,
  ADD COLUMN IF NOT EXISTS city             text,
  ADD COLUMN IF NOT EXISTS postal_code     text,
  ADD COLUMN IF NOT EXISTS shipping_method text,
  ADD COLUMN IF NOT EXISTS payment_method  text,
  ADD COLUMN IF NOT EXISTS coupon_code     text,
  ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_cost   numeric(10,2) NOT NULL DEFAULT 0;
