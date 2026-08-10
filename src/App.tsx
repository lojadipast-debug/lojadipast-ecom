import { useCallback, useEffect, useState } from 'react';
import {
  ShoppingBag,
  User,
  Heart,
  Search,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Trash2,
  X,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/store/router';
import { AdminPage } from '@/pages/AdminPage';

// --- TIPOS ---
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock_status: string;
  images: string[];
  has_sizes: boolean;
  has_colors: boolean;
  sizes: string[];
  colors: { name: string; hex: string }[];
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  bebe: 'Bebé',
  menina: 'Menina',
  menino: 'Menino',
  mochilas: 'Mochilas',
  brinquedos: 'Brinquedos',
  acessorios: 'Acessórios',
};

// --- COMPONENTE PRINCIPAL ---
export function App() {
  const { currentRoute, selectedCategory, selectedProductId, navigate } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Carregar produtos do Supabase
  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data as Product[]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Gestão de Carrinho e Favoritos
  const addToCart = (product: Product, size?: string, color?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [...prev, { product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-cream-50 font-sans text-ink-900 antialiased">
      {/* Banner Superior */}
      <div className="bg-lilac-100 py-2 text-center text-xs font-semibold tracking-wide text-lilac-900">
        ✨ OFERTA ESPECIAL: Portes grátis em compras superiores a 50€! ✨
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md ring-1 ring-ink-100">
        <div className="container-x flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid h-10 w-10 place-items-center rounded-xl text-ink-600 sm:hidden hover:bg-cream-100"
            >
              <Menu size={22} />
            </button>
            <button
              onClick={() => navigate('home')}
              className="font-display text-3xl font-bold tracking-tight text-ink-900"
            >
              dipa<span className="text-lilac-500">.</span>
            </button>
          </div>

          {/* Navegação Desktop */}
          <nav className="hidden items-center gap-6 text-sm font-semibold text-ink-600 sm:flex">
            <button
              onClick={() => navigate('home')}
              className={`transition-colors hover:text-ink-900 ${currentRoute === 'home' ? 'text-lilac-600' : ''}`}
            >
              Início
            </button>
            {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
              <button
                key={catKey}
                onClick={() => navigate('catalog', { category: catKey })}
                className={`transition-colors hover:text-ink-900 ${
                  currentRoute === 'catalog' && selectedCategory === catKey ? 'text-lilac-600' : ''
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Ações do Utilizador */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('cart')}
              className="relative grid h-10 w-10 place-items-center rounded-xl bg-cream-100 text-ink-700 transition-colors hover:bg-lilac-100 hover:text-lilac-700"
            >
              <ShoppingBag size={20} />
              {cartTotalItems > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-lilac-500 text-[10px] font-bold text-white">
                  {cartTotalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('admin')}
              className="grid h-10 w-10 place-items-center rounded-xl bg-cream-100 text-ink-700 transition-colors hover:bg-lilac-100 hover:text-lilac-700"
              title="Painel de Administração"
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo das Páginas */}
      <main>
        {currentRoute === 'home' && (
          <HomePage
            products={products}
            onSelectProduct={(id) => navigate('product', { productId: id })}
            onSelectCategory={(cat) => navigate('catalog', { category: cat })}
          />
        )}

        {currentRoute === 'catalog' && (
          <CatalogView
            products={products}
            category={selectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectProduct={(id) => navigate('product', { productId: id })}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {currentRoute === 'product' && selectedProductId && (
          <ProductDetailView
            productId={selectedProductId}
            products={products}
            onAddToCart={addToCart}
            isFavorite={favorites.includes(selectedProductId)}
            onToggleFavorite={() => toggleFavorite(selectedProductId)}
          />
        )}

        {currentRoute === 'cart' && (
          <CartView
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onNavigateHome={() => navigate('home')}
          />
        )}

        {currentRoute === 'admin' && <AdminPage />}
      </main>

      {/* Rodapé */}
      <footer className="mt-20 border-t border-ink-100 bg-white py-12">
        <div className="container-x text-center text-xs font-semibold text-ink-400">
          &copy; {new Date().getFullYear()} Loja Dipa. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

// --- SUB-VIEWS SIMPLIFICADAS ---

function HomePage({
  products,
  onSelectProduct,
  onSelectCategory,
}: {
  products: Product[];
  onSelectProduct: (id: string) => void;
  onSelectCategory: (cat: string) => void;
}) {
  return (
    <div className="container-x py-10 space-y-12">
      <div className="rounded-3xl bg-lilac-100 p-8 sm:p-16 text-center">
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-lilac-900">
          Peças com amor para os mais pequenos.
        </h1>
        <p className="mt-4 text-sm sm:text-base text-lilac-700">
          Descobre a nossa coleção única de roupa, acessórios e brinquedos.
        </p>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold mb-6">Categorias</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
            <button
              key={catKey}
              onClick={() => onSelectCategory(catKey)}
              className="rounded-2xl bg-white p-6 ring-1 ring-ink-100 text-center font-bold text-ink-800 hover:ring-lilac-300 transition-all"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold mb-6">Novidades</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.slice(0, 4).map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProduct(p.id)}
              className="cursor-pointer rounded-2xl bg-white p-4 ring-1 ring-ink-100 hover:shadow-soft-lg transition-all"
            >
              <div className="h-48 rounded-xl bg-cream-100 overflow-hidden mb-3">
                {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
              </div>
              <h3 className="font-semibold text-sm line-clamp-1">{p.name}</h3>
              <p className="text-lilac-600 font-bold mt-1">{p.price.toFixed(2)} €</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CatalogView({
  products,
  category,
  searchQuery,
  onSearchChange,
  onSelectProduct,
}: {
  products: Product[];
  category?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectProduct: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}) {
  const filtered = products.filter((p) => {
    const matchCategory = !category || p.category === category;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="container-x py-10">
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h1 className="font-display text-3xl font-bold">
          {category ? CATEGORY_LABELS[category] || category : 'Catálogo Completo'}
        </h1>
        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelectProduct(p.id)}
            className="cursor-pointer rounded-2xl bg-white p-4 ring-1 ring-ink-100 hover:shadow-soft-lg transition-all"
          >
            <div className="h-48 rounded-xl bg-cream-100 overflow-hidden mb-3">
              {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
            </div>
            <h3 className="font-semibold text-sm line-clamp-1">{p.name}</h3>
            <p className="text-lilac-600 font-bold mt-1">{p.price.toFixed(2)} €</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductDetailView({
  productId,
  products,
  onAddToCart,
}: {
  productId: string;
  products: Product[];
  onAddToCart: (p: Product, size?: string, color?: string) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const product = products.find((p) => p.id === productId);

  if (!product) return <div className="container-x py-10">Produto não encontrado.</div>;

  return (
    <div className="container-x py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-96 rounded-3xl bg-cream-100 overflow-hidden ring-1 ring-ink-100">
          {product.images?.[0] && <img src={product.images[0]} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="font-display text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-bold text-lilac-600 mt-2">{product.price.toFixed(2)} €</p>
          <p className="mt-4 text-ink-600 text-sm leading-relaxed">{product.description}</p>
          <button
            onClick={() => onAddToCart(product)}
            className="btn-primary mt-8 py-4 text-base"
          >
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}

function CartView({
  cart,
  onUpdateQuantity,
  onRemove,
  onNavigateHome,
}: {
  cart: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  onNavigateHome: () => void;
}) {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container-x py-16 text-center">
        <h2 className="font-display text-2xl font-bold">O seu carrinho está vazio</h2>
        <button onClick={onNavigateHome} className="btn-primary mt-6">
          Voltar às compras
        </button>
      </div>
    );
  }

  return (
    <div className="container-x py-10 max-w-3xl">
      <h1 className="font-display text-3xl font-bold mb-6">O seu Carrinho</h1>
      <div className="divide-y divide-ink-100 rounded-3xl bg-white p-6 ring-1 ring-ink-100">
        {cart.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 py-4">
            <div className="h-16 w-16 rounded-xl bg-cream-100 overflow-hidden shrink-0">
              {item.product.images?.[0] && <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1">{item.product.name}</h3>
              <p className="text-xs text-ink-500">{item.product.price.toFixed(2)} €</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onUpdateQuantity(idx, -1)} className="p-1 text-ink-500 hover:bg-cream-100 rounded-lg">
                <Minus size={14} />
              </button>
              <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
              <button onClick={() => onUpdateQuantity(idx, 1)} className="p-1 text-ink-500 hover:bg-cream-100 rounded-lg">
                <Plus size={14} />
              </button>
            </div>
            <button onClick={() => onRemove(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-ink-100 flex items-center justify-between">
        <span className="font-bold text-lg">Total</span>
        <span className="font-display text-2xl font-bold text-lilac-600">{total.toFixed(2)} €</span>
      </div>
    </div>
  );
}

// Exportação Padrão no final do ficheiro para resolver erros de import no main.tsx
export default App;
