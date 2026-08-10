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
    // Normalizar o caminho
    const currentPath = path || '/';

    if (currentPath.startsWith('/catalogo')) {
      return <CatalogPage />;
    }
    if (currentPath.startsWith('/produto/')) {
      const productId = currentPath.split('/produto/')[1] || '';
      return <ProductPage id={productId} />;
    }
    if (currentPath.startsWith('/carrinho') || currentPath.startsWith('/cart')) {
      return <CartPage />;
    }
    if (currentPath.startsWith('/checkout/sucesso')) {
      return <CheckoutSuccessPage />;
    }
    if (currentPath.startsWith('/checkout')) {
      return <CheckoutPage />;
    }
    if (currentPath.startsWith('/conta')) {
      const section = currentPath.split('/conta/')[1] || 'perfil';
      return <AccountPage section={section} />;
    }
    if (currentPath.startsWith('/admin')) {
      return <AdminPage />;
    }

    // Default para a página inicial
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
