import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/data/catalog';

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  error: string;
  getProductById: (id: string) => Product | undefined;
  getRelatedProducts: (product: Product, limit?: number) => Product[];
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

interface ProductRow {
  id: string;
  name: string;
  category: string;
  age_group: string | null;
  brand: string | null;
  price: string | number;
  old_price: string | number | null;
  colors: { name: string; hex: string }[];
  sizes: string[];
  images: string[];
  description: string | null;
  details: string[];
  rating: string | number;
  reviews_count: number;
  is_featured: boolean;
  is_new: boolean;
  is_promo: boolean;
  best_seller: boolean;
  stock_status: string;
  has_sizes: boolean;
  has_colors: boolean;
  stock_quantity: number;
  subcategory: string | null;
  promo_active: boolean;
  promo_original_price: string | number | null;
  promo_price: string | number | null;
  promo_start_date: string | null;
  promo_end_date: string | null;
}

function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Product['category'],
    ageGroup: (row.age_group ?? '1-3a') as Product['ageGroup'],
    brand: (row.brand ?? 'Dipa Soft') as Product['brand'],
    price: Number(row.price),
    oldPrice: row.old_price != null ? Number(row.old_price) : undefined,
    colors: Array.isArray(row.colors) ? row.colors : [],
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    images: Array.isArray(row.images) ? row.images : [],
    description: row.description ?? '',
    details: Array.isArray(row.details) ? row.details : [],
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    isFeatured: row.is_featured,
    isNew: row.is_new,
    isPromo: row.is_promo,
    bestSeller: row.best_seller,
    stockQuantity: row.stock_quantity ?? 0,
    subcategory: row.subcategory ?? undefined,
    promoActive: row.promo_active ?? false,
    promoOriginalPrice: row.promo_original_price != null ? Number(row.promo_original_price) : undefined,
    promoPrice: row.promo_price != null ? Number(row.promo_price) : undefined,
    promoStartDate: row.promo_start_date,
    promoEndDate: row.promo_end_date,
  };
}

const SELECT_COLUMNS =
  'id, name, category, age_group, brand, price, old_price, colors, sizes, images, description, details, rating, reviews_count, is_featured, is_new, is_promo, best_seller, stock_status, has_sizes, has_colors, stock_quantity, subcategory, promo_active, promo_original_price, promo_price, promo_start_date, promo_end_date';

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('products')
      .select(SELECT_COLUMNS)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    if (data) {
      setProducts((data as ProductRow[]).map(mapRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const getRelatedProducts = useCallback(
    (product: Product, limit = 4) =>
      products
        .filter(
          (p) =>
            p.id !== product.id &&
            (p.category === product.category || p.brand === product.brand)
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit),
    [products]
  );

  const value: ProductsContextValue = useMemo(
    () => ({ products, loading, error, getProductById, getRelatedProducts }),
    [products, loading, error, getProductById, getRelatedProducts]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
