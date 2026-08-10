import { useEffect } from 'react';
import { useRouter } from '@/store/router';
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

export function App() {
  const { path } = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  const renderRoute = () => {
    if (path === '/' || path === '') {
      return <HomePage />;
    }
    if (path.startsWith('/catalogo')) {
      return <CatalogPage />;
    }
    if (path.startsWith('/produto/')) {
      return <ProductPage />;
    }
    if (path === '/carrinho') {
      return <CartPage />;
    }
    if (path === '/checkout') {
      return <CheckoutPage />;
    }
    if (path === '/checkout/sucesso') {
      return <CheckoutSuccessPage />;
    }
    if (path.startsWith('/conta')) {
      return <AccountPage />;
    }
    if (path.startsWith('/admin')) {
      return <AdminPage />;
    }

    return <HomePage />;
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col font-sans text-ink-900 antialiased selection:bg-lilac-200">
      <Header />
      <main className="flex-1">{renderRoute()}</main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
    </div>
  );
}

export default App;
