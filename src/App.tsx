import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { RouterProvider, useRouter, parseRoute } from '@/store/router';
import { CartProvider } from '@/store/cart';
import { AccountProvider } from '@/store/account';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { SearchOverlay } from '@/components/SearchOverlay';
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { ProductPage } from '@/pages/ProductPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { CheckoutSuccessPage } from '@/pages/CheckoutSuccessPage';
import { AccountPage } from '@/pages/AccountPage';
import { AdminPage } from '@/pages/AdminPage';

function AppRoutes() {
  const { path } = useRouter();
  const route = parseRoute(path);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.title = titleFor(route);
  }, [route]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <main className="flex-1">
        {route.name === 'home' && <HomePage />}
        {route.name === 'catalog' && (
          <CatalogPage key={route.category ?? 'all'} category={route.category ?? 'todos'} />
        )}
        {route.name === 'product' && <ProductPage id={route.id ?? ''} />}
        {route.name === 'cart' && <CartPage />}
        {route.name === 'checkout' && <CheckoutPage />}
        {route.name === 'checkout-success' && <CheckoutSuccessPage />}
        {route.name === 'account' && <AccountPage section={route.section ?? 'perfil'} />}
        {route.name === 'admin' && <AdminPage />}
      </main>
      <Footer />
      <CartDrawer />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <BackToTop />
    </div>
  );
}

function titleFor(route: ReturnType<typeof parseRoute>): string {
  switch (route.name) {
    case 'home':
      return 'Dipa — Tudo para os mais pequenos';
    case 'catalog':
      return route.category ? `${route.category} · Dipa` : 'Catálogo · Dipa';
    case 'product':
      return 'Produto · Dipa';
    case 'cart':
      return 'Carrinho · Dipa';
    case 'checkout':
      return 'Checkout · Dipa';
    case 'checkout-success':
      return 'Encomenda confirmada · Dipa';
    case 'account':
      return 'A minha conta · Dipa';
    case 'admin':
      return 'Painel de administração · Dipa';
  }
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-7 right-7 z-30 grid h-13 w-13 place-items-center rounded-full bg-ink-900 text-white shadow-soft-lg ring-1 ring-ink-700 transition-all duration-300 hover:scale-110 hover:bg-lilac-700 hover:ring-lilac-500 animate-fade-in"
      style={{ height: '52px', width: '52px' }}
      aria-label="Voltar ao topo"
    >
      <ArrowUp size={20} />
    </button>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AccountProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AccountProvider>
    </RouterProvider>
  );
}
