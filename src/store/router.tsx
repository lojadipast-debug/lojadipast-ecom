import { create } from 'zustand';

type Route = 'home' | 'catalog' | 'product' | 'cart' | 'account' | 'admin';

interface RouterStore {
  currentRoute: Route;
  selectedCategory?: string;
  selectedProductId?: string;
  navigate: (route: Route, params?: { category?: string; productId?: string }) => void;
}

const getInitialRoute = (): { route: Route; category?: string; productId?: string } => {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (hash === 'admin') return { route: 'admin' };
  if (hash === 'cart') return { route: 'cart' };
  if (hash === 'conta' || hash === 'account') return { route: 'account' };
  if (hash.startsWith('produto/')) return { route: 'product', productId: hash.split('/')[1] };
  if (hash.startsWith('categoria/')) return { route: 'catalog', category: hash.split('/')[1] };
  return { route: 'home' };
};

const initial = getInitialRoute();

export const useRouter = create<RouterStore>((set) => ({
  currentRoute: initial.route,
  selectedCategory: initial.category,
  selectedProductId: initial.productId,
  navigate: (route, params) => {
    let hash = '#/';
    if (route === 'admin') hash = '#/admin';
    else if (route === 'cart') hash = '#/cart';
    else if (route === 'account') hash = '#/conta';
    else if (route === 'product' && params?.productId) hash = `#/produto/${params.productId}`;
    else if (route === 'catalog' && params?.category) hash = `#/categoria/${params.category}`;

    window.location.hash = hash;
    set({
      currentRoute: route,
      selectedCategory: params?.category,
      selectedProductId: params?.productId,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
}));
