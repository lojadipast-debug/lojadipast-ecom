/*
# Ensure public read access on products and fix profile upsert

1. Products table
   - Re-affirms the public SELECT policy for anon + authenticated roles.
   - Ensures the anon role can read the catalog without authentication.

2. account_profiles table
   - Re-affirms all four CRUD policies (select/insert/update/delete) scoped to auth.uid().
   - Ensures each authenticated user can read and update only their own profile row.

3. Important Notes
   - No data is changed or removed.
   - No columns or tables are dropped or renamed.
   - Policies are dropped and recreated (idempotent).
*/

-- Products: ensure public SELECT for anon + authenticated
DROP POLICY IF EXISTS "anon_read_products" ON public.products;
CREATE POLICY "anon_read_products" ON public.products FOR SELECT
  TO anon, authenticated USING (true);

-- account_profiles: ensure owner-scoped CRUD
DROP POLICY IF EXISTS "Users can read own account profile" ON public.account_profiles;
CREATE POLICY "Users can read own account profile" ON public.account_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own account profile" ON public.account_profiles;
CREATE POLICY "Users can insert own account profile" ON public.account_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own account profile" ON public.account_profiles;
CREATE POLICY "Users can update own account profile" ON public.account_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own account profile" ON public.account_profiles;
CREATE POLICY "Users can delete own account profile" ON public.account_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
