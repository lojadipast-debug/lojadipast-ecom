import { useState, useEffect } from 'react';

export type Route = string;

interface NavigateParams {
  category?: string;
  productId?: string;
}

function getPathFromHash(): string {
  const hash = window.location.hash.replace('#', '');
  if (!hash || hash === '/') return '/';
  return hash.startsWith('/') ? hash : `/${hash}`;
}

export function navigate(path: Route, params?: NavigateParams) {
  let target = path;

  if (params?.category) {
    target = `/catalogo/${params.category}`;
  } else if (params?.productId) {
    target = `/produto/${params.productId}`;
  }

  if (!target.startsWith('/')) {
    target = `/${target}`;
  }

  window.location.hash = target;
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

  const parts = path.split('/').filter(Boolean);

  // Extrai subcategoria e ID do produto do caminho
  let selectedCategory: string | undefined = undefined;
  let selectedProductId: string | undefined = undefined;

  if (path.startsWith('/catalogo/')) {
    selectedCategory = parts[1];
  } else if (path.startsWith('/produto/')) {
    selectedProductId = parts[1];
  }

  return {
    path,
    currentRoute: path,
    selectedCategory,
    selectedProductId,
    navigate: (route: Route, params?: NavigateParams) => navigate(route, params),
  };
}
