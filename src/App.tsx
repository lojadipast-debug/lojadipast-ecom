import { useEffect, useState } from 'react';
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
  const [searchOpen, setSearchOpen] = useState(false);

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
      const productId = path.split('/produto/')[1] || '';
      return <ProductPage id={productId} />;
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
      const section = path.split('/conta/')[1] || 'perfil';
      return <AccountPage section={section} />;
    }
    if (path.startsWith('/admin')) {
      return <AdminPage />;
    }

    return <HomePage />;
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col font-sans text-ink-900 antialiased selection:bg-lilac-200">
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <main className="flex-1">{renderRoute()}</main>
      <Footer />
      <CartDrawer />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export default App;
