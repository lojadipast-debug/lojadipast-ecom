import { useState, useEffect } from 'react';

export type Route = string;

function getPathFromHash(): string {
  const hash = window.location.hash.replace('#', '');
  return hash || '/';
}

export function navigate(path: Route) {
  window.location.hash = path.startsWith('/') ? path : `/${path}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function useRouter() {
  const [path, setPath] = useState<string>(getPathFromHash());

  useEffect(() => {
    const handleHashChange = () => {
      setPath(getPathFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Helpers para compatibilidade com o App
  const currentRoute = path.startsWith('/admin')
    ? 'admin'
    : path.startsWith('/carrinho') || path.startsWith('/cart')
    ? 'cart'
    : path.startsWith('/conta')
    ? 'account'
    : path.startsWith('/produto/')
    ? 'product'
    : path.startsWith('/catalogo')
    ? 'catalog'
    : 'home';

  const parts = path.split('/');
  const selectedCategory = path.startsWith('/catalogo/') ? parts[2] : undefined;
  const selectedProductId = path.startsWith('/produto/') ? parts[2] : undefined;

  return {
    path,
    currentRoute,
    selectedCategory,
    selectedProductId,
    navigate: (route: Route) => navigate(route),
  };
}
