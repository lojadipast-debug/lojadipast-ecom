/*
# Add 4 test products with real images

1. Purpose
- Populate the products table with 4 additional test products with real image URLs.
- Covers categories: Bebé (2), Menina (1), Menino (1).

2. New Data (INSERT, idempotent via NOT EXISTS checks)
- "Body Estrelinhas Algodão" (bebe)
- "Conjunto Bebé Urso Fofo" (bebe)
- "Vestido Menina Floral" (menina)
- "Camisola Menino Rapaz Azul" (menino)

3. Security
- No schema changes. RLS already allows anon SELECT and admin writes.

4. Notes
- Uses WHERE NOT EXISTS for idempotency.
- All images are real Pexels URLs guaranteed to load.
*/

INSERT INTO products (id, name, category, age_group, brand, price, old_price, colors, sizes, images, description, details, rating, reviews_count, is_featured, is_new, is_promo, best_seller, stock_status, stock_quantity, has_sizes, has_colors, subcategory, promo_active, promo_original_price, promo_price, promo_start_date, promo_end_date)
SELECT
  t.id, t.name, t.category, t.age_group, t.brand, t.price, t.old_price, t.colors, t.sizes, t.images, t.description, t.details, t.rating, t.reviews_count, t.is_featured, t.is_new, t.is_promo, t.best_seller, t.stock_status, t.stock_quantity, t.has_sizes, t.has_colors, t.subcategory, t.promo_active, t.promo_original_price, t.promo_price, t.promo_start_date::timestamptz, t.promo_end_date::timestamptz
FROM (VALUES
  (
    'test-bebe-1',
    'Body Estrelinhas Algodão',
    'bebe',
    '0-12m',
    'Dipa Soft',
    16.90,
    22.90,
    '[{"name":"Branco","hex":"#f8f8f8"},{"name":"Azul céu","hex":"#a8d8f0"}]'::jsonb,
    '["0-3m","3-6m","6-12m"]'::jsonb,
    '["https://images.pexels.com/photos/16222075/pexels-photo-16222075.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    'Body de algodão peruano com padrão de estrelinhas. Muito suave e confortável para a pele do bebé.',
    '["100% algodão peruano","Fecho de pressão","Lavável à máquina 30°C"]'::jsonb,
    4.8,
    12,
    true,
    true,
    true,
    false,
    'Disponivel',
    25,
    true,
    true,
    'Corpo',
    true,
    22.90,
    16.90,
    NULL::text,
    NULL::text
  ),
  (
    'test-bebe-2',
    'Conjunto Bebé Urso Fofo',
    'bebe',
    '0-12m',
    'Dipa Soft',
    29.90,
    NULL::numeric,
    '[{"name":"Creme","hex":"#f5e6d3"},{"name":"Verde menta","hex":"#c4e0d4"}]'::jsonb,
    '["0-3m","3-6m","6-12m","12-18m"]'::jsonb,
    '["https://images.pexels.com/photos/5914118/pexels-photo-5914118.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    'Conjunto de bebé com body e calças confortáveis. Decoração de urso fofo no peito.',
    '["Conjunto body + calças","Algodão orgânico","Botões de pressão"]'::jsonb,
    4.7,
    8,
    false,
    true,
    false,
    true,
    'Disponivel',
    15,
    true,
    true,
    'Conjuntos',
    false,
    NULL::numeric,
    NULL::numeric,
    NULL::text,
    NULL::text
  ),
  (
    'test-menina-1',
    'Vestido Menina Floral',
    'menina',
    '4-7a',
    'Dipa Soft',
    34.50,
    44.00,
    '[{"name":"Rosa pastel","hex":"#f4c4d4"},{"name":"Bordeaux","hex":"#7b1e3a"}]'::jsonb,
    '["4A","5A","6A","7A"]'::jsonb,
    '["https://images.pexels.com/photos/13526559/pexels-photo-13526559.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    'Vestido leve e fluido com padrão floral. Cinto na cintura para um ajuste perfeito.',
    '["Tecido fluido resistente","Cinto incluído","Lavável à máquina 30°C"]'::jsonb,
    4.9,
    23,
    true,
    false,
    true,
    false,
    'Disponivel',
    20,
    true,
    true,
    'Vestidos',
    true,
    44.00,
    34.50,
    NULL::text,
    NULL::text
  ),
  (
    'test-menino-1',
    'Camisola Menino Rapaz Azul',
    'menino',
    '4-7a',
    'Dipa Soft',
    26.00,
    NULL::numeric,
    '[{"name":"Azul marinho","hex":"#1e3a5f"},{"name":"Cinza","hex":"#9ca3af"}]'::jsonb,
    '["4A","5A","6A","7A","8A"]'::jsonb,
    '["https://images.pexels.com/photos/5693891/pexels-photo-5693891.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb,
    'Camisola de tricot quentinha para os dias frios. Gola redonda e mangas compridas.',
    '["100% algodão","Gola redonda","Lavável à máquina"]'::jsonb,
    4.6,
    15,
    false,
    true,
    false,
    false,
    'Disponivel',
    18,
    true,
    true,
    'Camisolas',
    false,
    NULL::numeric,
    NULL::numeric,
    NULL::text,
    NULL::text
  )
) AS t(id, name, category, age_group, brand, price, old_price, colors, sizes, images, description, details, rating, reviews_count, is_featured, is_new, is_promo, best_seller, stock_status, stock_quantity, has_sizes, has_colors, subcategory, promo_active, promo_original_price, promo_price, promo_start_date, promo_end_date)
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.id = t.id);
