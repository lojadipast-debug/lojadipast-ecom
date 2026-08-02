import { useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useRouter } from '@/store/router';
import { formatPrice } from '@/data/catalog';

const FREE_SHIPPING = 50;

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeFromCart, subtotal } = useCart();
  const { navigate } = useRouter();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const remaining = Math.max(0, FREE_SHIPPING - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING) * 100);

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in" onClick={closeCart} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-in-right flex-col bg-cream-50 shadow-soft-lg">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
            <ShoppingBag size={18} /> Carrinho
            <span className="text-sm font-normal text-ink-400">({items.length})</span>
          </h2>
          <button
            onClick={closeCart}
            className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-ink-50"
            aria-label="Fechar carrinho"
          >
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-cream-100">
              <ShoppingBag size={28} className="text-ink-300" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-ink-900">O teu carrinho está vazio</p>
              <p className="mt-1 text-sm text-ink-500">
                Descobre peças feitas com carinho para os mais pequenos.
              </p>
            </div>
            <button
              onClick={() => {
                closeCart();
                navigate('/catalogo');
              }}
              className="btn-primary"
            >
              Começar a comprar
            </button>
          </div>
        ) : (
          <>
            <div className="px-5 pt-4">
              <p className="text-xs font-medium text-ink-600">
                {remaining > 0 ? (
                  <>
                    Faltam <span className="font-bold text-lilac-700">{formatPrice(remaining)}</span> para envios grátis
                  </>
                ) : (
                  <span className="font-semibold text-sky-700">Tens envios grátis!</span>
                )}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-300 to-lilac-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.key} className="flex gap-3">
                    <button
                      onClick={() => {
                        closeCart();
                        navigate(`/produto/${item.productId}`);
                      }}
                      className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-cream-100"
                    >
                      <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                    </button>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="line-clamp-2 text-sm font-semibold text-ink-900">{item.product.name}</p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {item.color} · Tam {item.size}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full bg-white ring-1 ring-ink-200">
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            className="grid h-7 w-7 place-items-center rounded-full text-ink-600 hover:bg-cream-100"
                            aria-label="Diminuir"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-ink-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            className="grid h-7 w-7 place-items-center rounded-full text-ink-600 hover:bg-cream-100"
                            aria-label="Aumentar"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-ink-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.key)}
                      className="self-start grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-rose-100 hover:text-rose-600"
                      aria-label="Remover"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-ink-100 bg-white px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-600">Subtotal</span>
                <span className="font-display text-lg font-semibold text-ink-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-400">Envio e impostos calculados no checkout</p>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/checkout');
                }}
                className="btn-primary mt-3 w-full"
              >
                Finalizar compra <ArrowRight size={16} />
              </button>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/carrinho');
                }}
                className="btn-ghost mt-2 w-full"
              >
                Ver carrinho completo
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
