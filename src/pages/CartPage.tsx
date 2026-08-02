import { useState } from 'react';
import { Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag, Truck, Check } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useRouter } from '@/store/router';
import { formatPrice } from '@/data/catalog';

export function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();
  const { navigate } = useRouter();
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [error, setError] = useState('');

  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 4.9;
  const discount = applied ? subtotal * applied.discount : 0;
  const total = Math.max(0, subtotal - discount) + shipping;

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = coupon.trim().toUpperCase();
    if (code === 'DIPA10') {
      setApplied({ code, discount: 0.1 });
      setCoupon('');
    } else if (code === 'BEMVINDO') {
      setApplied({ code, discount: 0.15 });
      setCoupon('');
    } else {
      setError('Código inválido. Experimenta DIPA10.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-x flex flex-col items-center justify-center gap-5 py-28 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-cream-100">
          <ShoppingBag size={32} className="text-ink-300" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">O teu carrinho está vazio</h1>
          <p className="mt-2 text-ink-500">Descobre peças escolhidas com carinho para os mais pequenos.</p>
        </div>
        <button onClick={() => navigate('/catalogo')} className="btn-primary">
          Começar a comprar <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <h1 className="reveal font-display text-4xl font-semibold tracking-tight text-ink-900">
        O teu carrinho
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="reveal flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex gap-4 rounded-3xl bg-white p-4 ring-1 ring-ink-100"
            >
              <button
                onClick={() => navigate(`/produto/${item.productId}`)}
                className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-cream-100"
              >
                <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
              </button>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-lilac-600">
                      {item.product.brand}
                    </p>
                    <h3
                      className="cursor-pointer font-display text-base font-semibold text-ink-900 hover:text-lilac-700"
                      onClick={() => navigate(`/produto/${item.productId}`)}
                    >
                      {item.product.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.key)}
                    className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-rose-100 hover:text-rose-600"
                    aria-label="Remover"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  {item.color} · Tamanho {item.size}
                </p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center gap-1 rounded-full bg-cream-100 ring-1 ring-ink-200">
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-600 hover:bg-white"
                      aria-label="Diminuir"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold text-ink-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-600 hover:bg-white"
                      aria-label="Aumentar"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-display text-lg font-semibold text-ink-900">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => navigate('/catalogo')}
              className="text-sm font-semibold text-lilac-700 hover:underline"
            >
              ← Continuar a comprar
            </button>
            <button
              onClick={clearCart}
              className="text-sm text-ink-400 hover:text-rose-600"
            >
              Esvaziar carrinho
            </button>
          </div>
        </div>

        <aside className="reveal lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-white p-6 ring-1 ring-ink-100 shadow-soft">
            <h2 className="font-display text-lg font-semibold text-ink-900">Resumo</h2>

            <form onSubmit={applyCoupon} className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                Código de desconto
              </label>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="DIPA10"
                    className="input-field pl-9"
                  />
                </div>
                <button type="submit" className="btn-soft px-4">Aplicar</button>
              </div>
              {applied && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-sky-700">
                  <Check size={14} /> {applied.code} aplicado (-{applied.discount * 100}%)
                </p>
              )}
              {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
            </form>

            <div className="mt-5 border-t border-ink-100 pt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
                Estimativa de envio
              </p>
              <div className="flex items-center gap-2 rounded-xl bg-cream-100 px-3 py-2 text-sm text-ink-600">
                <Truck size={15} className="text-lilac-600" />
                {shipping === 0 ? 'Envio grátis · 24-48h' : `Standard · ${formatPrice(shipping)}`}
              </div>
            </div>

            <dl className="mt-5 flex flex-col gap-2 border-t border-ink-100 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-600">Subtotal</dt>
                <dd className="font-medium text-ink-900">{formatPrice(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sky-700">
                  <dt>Desconto</dt>
                  <dd>-{formatPrice(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-600">Envio</dt>
                <dd className="font-medium text-ink-900">
                  {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
                </dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-ink-100 pt-3">
                <dt className="font-display text-base font-semibold text-ink-900">Total</dt>
                <dd className="font-display text-xl font-semibold text-ink-900">{formatPrice(total)}</dd>
              </div>
            </dl>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary mt-5 w-full"
            >
              Finalizar compra <ArrowRight size={16} />
            </button>
            <p className="mt-3 text-center text-xs text-ink-400">Pagamento seguro · SSL</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
