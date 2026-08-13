import { Heart, ShoppingBag } from 'lucide-react';
import { useRouter } from '@/store/router';
import { useCart } from '@/store/cart';
import { formatPrice, effectivePrice, effectiveOldPrice, isOutOfStock, isPromoActiveNow, isNewWithin10Days } from '@/data/catalog';
import type { Product } from '@/data/catalog';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { navigate } = useRouter();
  const { toggleFavorite, isFavorite, addToCart } = useCart();
  const fav = isFavorite(product.id);
  const outOfStock = isOutOfStock(product);
  const promoNow = isPromoActiveNow(product);
  const showNew = product.isNew || isNewWithin10Days(product);
  const currentPrice = effectivePrice(product);
  const oldPrice = effectiveOldPrice(product);
  const discount = oldPrice
    ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
    : 0;

  return (
    <article
      className="group relative flex flex-col"
      style={{ transitionDelay: `${(index % 4) * 80}ms` }}
    >
      <button
        onClick={() => navigate(`/produto/${product.id}`)}
        className="relative block aspect-[4/5] overflow-hidden rounded-4xl bg-cream-100 ring-1 ring-ink-100/60"
        aria-label={`Ver ${product.name}`}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110"
        />
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}

        {/* badges */}
        <div className="absolute left-3.5 top-3.5 flex flex-col gap-1.5">
          {showNew && (
            <span className="rounded-full bg-sky-300 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-ink-900 shadow-soft">
              Novo
            </span>
          )}
          {(product.isPromo || promoNow) && discount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-rose-500 px-2 py-1 text-[10px] font-extrabold leading-none text-white shadow-soft ring-1 ring-white/50">
              -{discount}%
            </span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-ink-900 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-soft">
              Esgotado
            </span>
          )}
          {product.bestSeller && !showNew && !product.isPromo && !promoNow && !outOfStock && (
            <span className="rounded-full bg-cream-300 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-ink-900 shadow-soft">
              Top
            </span>
          )}
        </div>

        {/* gradient on hover for legibility */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-900/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </button>

      {/* favorite */}
      <button
        onClick={() => toggleFavorite(product.id)}
        aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        className={`absolute right-3.5 top-3.5 grid h-10 w-10 place-items-center rounded-full backdrop-blur-md transition-all duration-300 active:scale-90 ${
          fav
            ? 'bg-rose-400 text-white shadow-soft animate-pop-soft'
            : 'bg-white/85 text-ink-500 hover:scale-110 hover:text-rose-600'
        }`}
      >
        <Heart size={17} className={fav ? 'fill-white' : ''} />
      </button>

      {/* quick add */}
      {!outOfStock && (
        <button
          onClick={() => {
            const result = addToCart({
              productId: product.id,
              size: product.sizes[0] ?? 'Único',
              color: product.colors[0]?.name ?? 'Padrão',
              quantity: 1,
            });
            if (result.ok) {
              window.dispatchEvent(new CustomEvent('dipa:signup-prompt', { detail: 'cart' }));
            }
          }}
          className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 translate-y-4 items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-xs font-bold text-white opacity-0 shadow-soft-lg transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 hover:bg-lilac-700"
        >
          <ShoppingBag size={14} /> Adicionar
        </button>
      )}

      <div className="mt-4 flex flex-1 flex-col">
        <span className="text-[11px] font-bold uppercase tracking-wider text-lilac-600">
          {product.brand}
        </span>
        <h3
          className="mt-1.5 line-clamp-2 cursor-pointer font-display text-[15px] font-bold leading-snug text-ink-900 transition-colors hover:text-lilac-700"
          onClick={() => navigate(`/produto/${product.id}`)}
        >
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-display text-base font-extrabold text-ink-900">{formatPrice(currentPrice)}</span>
          {oldPrice && oldPrice > currentPrice && (
            <span className="text-sm text-ink-400 line-through">
              {formatPrice(oldPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
