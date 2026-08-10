import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface RouterContextValue {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const pathname = window.location.pathname.replace(/^\//, '');
    return hash || pathname || '/';
  });

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const pathname = window.location.pathname.replace(/^\//, '');
      setPath(hash || pathname || '/');
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };

    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);

    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onHash);
    };
  }, []);

  const navigate = (to: string) => {
    const target = to.startsWith('#') ? to.slice(1) : to;
    if (target === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.hash = target.startsWith('/') ? target : `/${target}`;
  };

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export function parseRoute(path: string): Route {
  // Limpa tudo o que estiver no URL (hash, pathname ou barras extras)
  const hash = window.location.hash.replace(/^#\/?/, '');
  const pathname = window.location.pathname.replace(/^\//, '');
  const currentPath = hash || pathname || path;

  const clean = currentPath.split('?')[0];
  const segments = clean.split('/').filter(Boolean);

  if (segments.length === 0) return { name: 'home' };

  if (segments.includes('admin')) return { name: 'admin' };
  if (segments[0] === 'catalogo') return { name: 'catalog', category: segments[1] };
  if (segments[0] === 'produto' && segments[1]) return { name: 'product', id: segments[1] };
  if (segments[0] === 'carrinho') return { name: 'cart' };
  if (segments[0] === 'checkout') return { name: 'checkout' };
  if (segments[0] === 'checkout-success') return { name: 'checkout-success' };
  if (segments[0] === 'conta') return { name: 'account', section: segments[1] ?? 'perfil' };

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
