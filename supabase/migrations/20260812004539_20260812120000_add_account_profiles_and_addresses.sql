/*
# Add persistent account profiles and delivery addresses

1. New Tables
- `account_profiles` stores the signed-in user's name, phone, and birth date.
- `account_addresses` stores the signed-in user's saved delivery addresses.
- Both tables use the authenticated user's id as the owner and keep timestamps.

2. Security
- Row level security is enabled on both tables.
- Authenticated users can select, insert, update, and delete only their own records.
- New address rows automatically receive the current authenticated user's id.

3. Important Notes
- Existing account and order data is not changed or removed.
- The browser can only access rows belonging to the current signed-in account.
*/

CREATE TABLE IF NOT EXISTS public.account_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  birth_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.account_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Casa',
  name text NOT NULL DEFAULT '',
  street text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  postal text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS account_addresses_user_id_idx ON public.account_addresses(user_id);

ALTER TABLE public.account_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own account profile" ON public.account_profiles;
CREATE POLICY "Users can read own account profile" ON public.account_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own account profile" ON public.account_profiles;
CREATE POLICY "Users can insert own account profile" ON public.account_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own account profile" ON public.account_profiles;
CREATE POLICY "Users can update own account profile" ON public.account_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own account profile" ON public.account_profiles;
CREATE POLICY "Users can delete own account profile" ON public.account_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own addresses" ON public.account_addresses;
CREATE POLICY "Users can read own addresses" ON public.account_addresses FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.account_addresses;
CREATE POLICY "Users can insert own addresses" ON public.account_addresses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own addresses" ON public.account_addresses;
CREATE POLICY "Users can update own addresses" ON public.account_addresses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.account_addresses;
CREATE POLICY "Users can delete own addresses" ON public.account_addresses FOR DELETE TO authenticated USING (auth.uid() = user_id);
