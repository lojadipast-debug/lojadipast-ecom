import { useState, useEffect } from 'react';

export type Route = 'home' | 'catalog' | 'product' | 'cart' | 'account' | 'admin';

export function getRouteFromHash(): { route: Route; category?: string; productId?: string } {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (hash === 'admin') return { route: 'admin' };
  if (hash === 'cart') return { route: 'cart' };
  if (hash === 'conta' || hash === 'account') return { route: 'account' };
  if (hash.startsWith('produto/')) return { route: 'product', productId: hash.split('/')[1] };
  if (hash.startsWith('categoria/')) return { route: 'catalog', category: hash.split('/')[1] };
  return { route: 'home' };
}

export function navigate(route: Route, params?: { category?: string; productId?: string }) {
  let hash = '#/';
  if (route === 'admin') hash = '#/admin';
  else if (route === 'cart') hash = '#/cart';
  else if (route === 'account') hash = '#/conta';
  else if (route === 'product' && params?.productId) hash = `#/produto/${params.productId}`;
  else if (route === 'catalog' && params?.category) hash = `#/categoria/${params.category}`;

  window.location.hash = hash;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function useRouter() {
  const [routeState, setRouteState] = useState(getRouteFromHash());

  useEffect(() => {
    const handleHashChange = () => {
      setRouteState(getRouteFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return {
    currentRoute: routeState.route,
    selectedCategory: routeState.category,
    selectedProductId: routeState.productId,
    navigate,
  };
}
