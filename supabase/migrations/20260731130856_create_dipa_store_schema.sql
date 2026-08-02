/*
# Create initial Dipa store database

Builds the data layer for the Dipa children's clothing store. The app currently
has no sign-in screen (login/register is a local-only mock), so this is a
single-tenant schema: every policy grants access to `anon, authenticated` so
the anon-key frontend can read public catalog data and submit orders.

1. New Tables
  - `products`
      Stores the catalog. Columns mirror the Product type in src/data/catalog.ts:
      id (text PK), name, category, age_group, brand, price, old_price,
      colors (jsonb array of {name,hex}), sizes (jsonb array of strings),
      images (jsonb array of URL strings), description, details (jsonb array
      of strings), rating, reviews_count, is_featured, is_new, is_promo,
      best_seller, created_at.
  - `reviews`
      Customer testimonials shown on the home page. Columns: id (text PK),
      product_id (FK -> products.id, nullable so standalone reviews work),
      name, location, rating (1-5), text, product_name, created_at.
  - `orders`
      Checkout submissions. Columns: id (uuid PK), customer_name, customer_email,
      status (text, defaults to 'Processamento'), total (numeric), created_at.
  - `order_items`
      Line items for each order. Columns: id (uuid PK), order_id (FK -> orders.id),
      product_id (text), product_name, size, color, quantity, unit_price.
  - `favorites`
      Product favorites keyed by a browser-generated session id (no auth).
      Columns: id (uuid PK), session_id (text), product_id (text), created_at.

2. Indexes
  - products(category) — category filter on catalog page.
  - products(brand) — brand filter.
  - products(is_featured), products(is_new), products(is_promo),
    products(best_seller) — home-page section queries.
  - reviews(product_id) — lookup reviews for a product.
  - order_items(order_id) — order detail join.
  - favorites(session_id, product_id) unique — prevent duplicate favorites.

3. Security (RLS)
  - RLS enabled on every table.
  - products: anon+authenticated SELECT (public catalog); no client writes.
  - reviews: anon+authenticated SELECT (public testimonials); no client writes.
  - orders: anon+authenticated INSERT (checkout) and SELECT (order lookup
    by email); no update/delete from the client.
  - order_items: anon+authenticated INSERT + SELECT (via join to orders).
  - favorites: full anon+authenticated CRUD — each browser manages its own
    favorites via session_id; data is non-sensitive.
*/

-- ── products ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  category      text NOT NULL,
  age_group     text,
  brand         text,
  price         numeric(10,2) NOT NULL DEFAULT 0,
  old_price     numeric(10,2),
  colors        jsonb NOT NULL DEFAULT '[]'::jsonb,
  sizes         jsonb NOT NULL DEFAULT '[]'::jsonb,
  images        jsonb NOT NULL DEFAULT '[]'::jsonb,
  description   text,
  details       jsonb NOT NULL DEFAULT '[]'::jsonb,
  rating        numeric(2,1) NOT NULL DEFAULT 0,
  reviews_count integer NOT NULL DEFAULT 0,
  is_featured   boolean NOT NULL DEFAULT false,
  is_new        boolean NOT NULL DEFAULT false,
  is_promo      boolean NOT NULL DEFAULT false,
  best_seller   boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand       ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured;
CREATE INDEX IF NOT EXISTS idx_products_is_new      ON products(is_new)      WHERE is_new;
CREATE INDEX IF NOT EXISTS idx_products_is_promo    ON products(is_promo)    WHERE is_promo;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(best_seller) WHERE best_seller;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_products" ON products;
CREATE POLICY "anon_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

-- ── reviews ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id           text PRIMARY KEY,
  product_id   text REFERENCES products(id) ON DELETE CASCADE,
  name         text NOT NULL,
  location     text,
  rating       integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  text         text NOT NULL,
  product_name text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_reviews" ON reviews;
CREATE POLICY "anon_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

-- ── orders ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  status        text NOT NULL DEFAULT 'Processamento',
  total         numeric(10,2) NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ── order_items ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   text NOT NULL,
  product_name text NOT NULL,
  size         text,
  color        text,
  quantity     integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price   numeric(10,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_order_items" ON order_items;
CREATE POLICY "anon_select_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ── favorites ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  product_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_session_product
  ON favorites(session_id, product_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_favorites" ON favorites;
CREATE POLICY "anon_select_favorites" ON favorites FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_favorites" ON favorites;
CREATE POLICY "anon_insert_favorites" ON favorites FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_favorites" ON favorites;
CREATE POLICY "anon_delete_favorites" ON favorites FOR DELETE
  TO anon, authenticated USING (true);
