/*
# Add Stripe session tracking column to orders

1. Modified tables
   - `orders`
       Adds `stripe_session_id` (text, nullable) to store the Stripe Checkout
       Session ID associated with each order. This lets the webhook correlate
       Stripe payment events back to the order row so the order status can be
       updated when payment succeeds.

2. Security
   - RLS policies unchanged. orders remains anon+authenticated INSERT + SELECT.
   - The webhook edge function uses the service role key to update order status
     server-side, bypassing RLS — this is intentional and secure because the
     webhook verifies the Stripe signature before acting.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stripe_session_id text;
