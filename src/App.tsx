import { useRouter } from '@/store/router';
import { AdminPage } from '@/pages/AdminPage';
// ... outros imports

export function App() {
  const { currentRoute } = useRouter();

  return (
    <div className="min-h-screen bg-cream-50 font-sans text-ink-900 antialiased">
      <Header />
      <main>
        {currentRoute === 'home' && <HomePage />}
        {currentRoute === 'catalog' && <CatalogPage />}
        {currentRoute === 'product' && <ProductPage />}
        {currentRoute === 'cart' && <CartPage />}
        {currentRoute === 'account' && <AccountPage />}
        {currentRoute === 'admin' && <AdminPage />}
      </main>
      <Footer />
    </div>
  );
}
