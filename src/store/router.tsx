import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface RouterContextValue {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(() => window.location.hash.replace(/^#/, '') || '/');

  useEffect(() => {
    const onHash = () => {
      setPath(window.location.hash.replace(/^#/, '') || '/');
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onHash);
    if (!window.location.hash) window.location.hash = '/';
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (to: string) => {
    const target = to.startsWith('#') ? to.slice(1) : to;
    if (target === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.hash = target;
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export function parseRoute(path: string): Route {
  const clean = path.split('?')[0];
  const segments = clean.split('/').filter(Boolean);
  if (segments.length === 0) return { name: 'home' };
  if (segments[0] === 'catalogo') return { name: 'catalog', category: segments[1] };
  if (segments[0] === 'produto' && segments[1])
    return { name: 'product', id: segments[1] };
  if (segments[0] === 'carrinho') return { name: 'cart' };
  if (segments[0] === 'checkout') return { name: 'checkout' };
  if (segments[0] === 'checkout-success') return { name: 'checkout-success' };
  if (segments[0] === 'conta') return { name: 'account', section: segments[1] ?? 'perfil' };
  if (segments[0] === 'admin') return { name: 'admin' };
  return { name: 'home' };
}

export type Route =
  | { name: 'home' }
  | { name: 'catalog'; category?: string }
  | { name: 'product'; id: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'checkout-success' }
  | { name: 'account'; section: string }
  | { name: 'admin' };
