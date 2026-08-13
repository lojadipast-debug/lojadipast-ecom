import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { effectivePrice } from '@/data/catalog';
import type { Product } from '@/data/catalog';
import { useProducts } from '@/store/products';

export interface CartItem {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export interface StoredCartItem extends CartItem {
  product: Product;
  key: string;
}

interface CartContextValue {
  items: StoredCartItem[];
  favorites: string[];
  addToCart: (item: CartItem) => { ok: boolean; message?: string };
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  cartCount: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  lastAddedKey: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = 'dipa-cart';
const FAV_KEY = 'dipa-favorites';

function cartItemKey(item: CartItem): string {
  return `${item.productId}__${item.size}__${item.color}`;
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { getProductById } = useProducts();
  const [rawItems, setRawItems] = useState<CartItem[]>(() => readStored<CartItem[]>(CART_KEY, []));
  const [favorites, setFavorites] = useState<string[]>(() => readStored<string[]>(FAV_KEY, []));
  const [isOpen, setIsOpen] = useState(false);
  const [lastAddedKey, setLastAddedKey] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(rawItems));
  }, [rawItems]);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addToCart = useCallback((item: CartItem): { ok: boolean; message?: string } => {
    const key = cartItemKey(item);
    const product = getProductById(item.productId);
    const stock = product?.stockQuantity ?? 0;
    const existing = rawItems.find((p) => cartItemKey(p) === key);
    const nextQuantity = Math.min(stock, (existing?.quantity ?? 0) + item.quantity);

    if (stock <= 0) return { ok: false, message: 'Produto esgotado.' };
    if (nextQuantity <= (existing?.quantity ?? 0)) {
      return { ok: false, message: `Apenas ${stock} em stock.` };
    }

    setRawItems((prev) => {
      const current = prev.find((p) => cartItemKey(p) === key);
      if (current) {
        return prev.map((p) =>
          cartItemKey(p) === key ? { ...p, quantity: Math.min(stock, p.quantity + item.quantity) } : p
        );
      }
      return [...prev, { ...item, quantity: Math.min(stock, item.quantity) }];
    });
    setLastAddedKey(key);
    setIsOpen(true);
    return { ok: true };
  }, [getProductById, rawItems]);

  const removeFromCart = useCallback((key: string) => {
    setRawItems((prev) => prev.filter((p) => cartItemKey(p) !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setRawItems((prev) => prev.filter((p) => cartItemKey(p) !== key));
      return;
    }
    setRawItems((prev) =>
      prev.map((p) => {
        if (cartItemKey(p) !== key) return p;
        const stock = getProductById(p.productId)?.stockQuantity ?? 0;
        return { ...p, quantity: Math.min(quantity, stock) };
      })
    );
  }, [getProductById]);

  const clearCart = useCallback(() => setRawItems([]), []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  const items: StoredCartItem[] = useMemo(
    () =>
      rawItems
        .map((item) => {
          const product = getProductById(item.productId);
          if (!product) return null;
          return { ...item, product, key: cartItemKey(item) };
        })
        .filter((x): x is StoredCartItem => x !== null),
    [rawItems, getProductById]
  );

  const cartCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    favorites,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleFavorite,
    isFavorite,
    cartCount,
    subtotal,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    lastAddedKey,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
