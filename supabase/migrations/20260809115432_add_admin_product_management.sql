/*
# Admin product management: stock column + admin write policies + storage bucket

1. Modified tables
   - `products`
       Adds `stock_status` (text, default 'Disponivel') so the admin panel can
       mark products as "Disponivel" or "Sem stock". Nullable with a default so
       existing rows stay valid.

2. Security — products RLS changes
   - The existing SELECT policy (anon + authenticated read) is kept so the
     storefront catalog continues to work for all visitors.
   - NEW write policies (INSERT, UPDATE, DELETE) are scoped to authenticated
     users whose `raw_app_meta_data->>'role' = 'admin'`. This means only users
     who have been granted the admin role (server-side, user-immutable) can
     create, edit, or delete products.
   - The admin role is stored in `raw_app_meta_data` (not `raw_user_meta_data`)
     because the latter is user-editable from the client and must not drive
     authorization.

3. Helper to grant admin role
   - A SECURITY DEFINER function `grant_admin_role(target_uid uuid)` lets a
     project operator (with service-role DB access) elevate a user to admin.
     It writes `role='admin'` into `raw_app_meta_data`. Callable only via
     service-role / postgres role (no anon/authenticated EXECUTE grant).

4. Storage
   - Creates a public bucket `products` for product images.
   - Storage policies: public read (anon + authenticated SELECT), admin-only
     upload/update/delete (authenticated with admin role in app_meta_data).
*/

-- ── stock_status column ───────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_status text NOT NULL DEFAULT 'Disponivel';

-- ── Admin write policies on products ──────────────────────
-- Keep existing SELECT policy (anon_read_products) as-is.

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated
  USING (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  )
  WITH CHECK (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated
  USING (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- ── Helper: grant admin role (service-role only) ──────────
CREATE OR REPLACE FUNCTION grant_admin_role(target_uid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(
      coalesce(raw_app_meta_data, '{}'::jsonb),
      '{role}',
      '"admin"'::jsonb,
      true
    )
  WHERE id = target_uid;
END;
$$;

REVOKE ALL ON FUNCTION grant_admin_role(uuid) FROM anon, authenticated;

-- ── Storage bucket for product images ─────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Public read: anyone can view product images
DROP POLICY IF EXISTS "public_read_products_bucket" ON storage.objects;
CREATE POLICY "public_read_products_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'products');

-- Admin upload: only authenticated admins can upload
DROP POLICY IF EXISTS "admin_upload_products_bucket" ON storage.objects;
CREATE POLICY "admin_upload_products_bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'products'
    AND coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- Admin update: only authenticated admins can update
DROP POLICY IF EXISTS "admin_update_products_bucket" ON storage.objects;
CREATE POLICY "admin_update_products_bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'products'
    AND coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  )
  WITH CHECK (
    bucket_id = 'products'
    AND coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );

-- Admin delete: only authenticated admins can delete
DROP POLICY IF EXISTS "admin_delete_products_bucket" ON storage.objects;
CREATE POLICY "admin_delete_products_bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'products'
    AND coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );
