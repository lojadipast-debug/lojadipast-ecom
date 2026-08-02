import { useState } from 'react';
import {
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  RefreshCw,
  ShieldCheck,
  Check,
  ZoomIn,
} from 'lucide-react';
import { useRouter } from '@/store/router';
import { useCart } from '@/store/cart';
import { getProductById, getRelatedProducts, formatPrice, CATEGORY_LABELS } from '@/data/catalog';
import { ProductCard } from '@/components/ProductCard';
import { StarRating } from '@/components/StarRating';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function ProductPage({ id }: { id: string }) {
  useScrollReveal();
  const { navigate } = useRouter();
  const { addToCart, toggleFavorite, isFavorite } = useCart();

  const product = getProductById(id);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [tab, setTab] = useState<'desc' | 'details' | 'reviews'>('desc');
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="container-x flex flex-col items-center justify-center gap-4 py-32 text-center">
        <p className="font-display text-2xl font-semibold text-ink-900">Produto não encontrado</p>
        <button onClick={() => navigate('/catalogo')} className="btn-primary">
          Voltar ao catálogo
        </button>
      </div>
    );
  }

  const related = getRelatedProducts(product);
  const fav = isFavorite(product.id);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const onZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleAdd = () => {
    if (!size) {
      setSize(product.sizes[0]);
    }
    if (!color) {
      setColor(product.colors[0].name);
    }
    addToCart({
      productId: product.id,
      size: size || product.sizes[0],
      color: color || product.colors[0].name,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container-x py-10">
      {/* breadcrumb */}
      <nav className="reveal flex flex-wrap items-center gap-2 text-xs text-ink-400">
        <button onClick={() => navigate('/')} className="hover:text-ink-700">Início</button>
        <ChevronRight size={12} />
        <button onClick={() => navigate(`/catalogo/${product.category}`)} className="hover:text-ink-700">
          {CATEGORY_LABELS[product.category]}
        </button>
        <ChevronRight size={12} />
        <span className="text-ink-700">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* gallery */}
        <div className="reveal flex flex-col gap-4 lg:flex-row-reverse">
          <div
            className="relative aspect-square flex-1 overflow-hidden rounded-4xl bg-cream-100 ring-1 ring-ink-100"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={onZoomMove}
          >
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300"
              style={
                zoom
                  ? { transform: 'scale(1.8)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                  : undefined
              }
            />
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-ink-600 backdrop-blur-sm">
              <ZoomIn size={12} /> Passa o rato para ampliar
            </span>
            {product.isPromo && discount > 0 && (
              <span className="absolute left-3 top-3 rounded-full bg-rose-400 px-3 py-1 text-xs font-bold text-white shadow-soft">
                -{discount}%
              </span>
            )}
          </div>

          {/* thumbnails */}
          <div className="flex gap-3 lg:flex-col">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 transition-all ${
                  activeImg === i ? 'ring-lilac-500' : 'ring-transparent hover:ring-ink-200'
                }`}
                aria-label={`Imagem ${i + 1}`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* info */}
        <div className="reveal lg:pl-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-lilac-600">
              {product.brand}
            </span>
            {product.isNew && (
              <span className="rounded-full bg-sky-300 px-2.5 py-0.5 text-[10px] font-bold uppercase text-sky-800">
                Novo
              </span>
            )}
          </div>

          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={product.rating} count={product.reviewsCount} size={16} />
            <button
              onClick={() => setTab('reviews')}
              className="text-sm text-ink-500 underline-offset-2 hover:underline"
            >
              Ver avaliações
            </button>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-3xl font-semibold text-ink-900">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-lg text-ink-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {/* color */}
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-900">Cor</p>
              <p className="text-sm text-ink-500">{color || product.colors[0].name}</p>
            </div>
            <div className="mt-3 flex gap-2.5">
              {product.colors.map((c) => {
                const active = (color || product.colors[0].name) === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    aria-label={c.name}
                    className={`relative h-9 w-9 rounded-full ring-2 transition-all ${
                      active ? 'ring-lilac-500 ring-offset-2 ring-offset-cream-50' : 'ring-ink-200 hover:ring-ink-300'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {active && (
                      <Check size={14} className="absolute inset-0 m-auto text-ink-900 mix-blend-difference" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* size */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-900">Tamanho</p>
              <button className="text-xs font-semibold text-lilac-600 hover:underline">
                Guia de tamanhos
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const active = (size || product.sizes[0]) === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-12 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                      active
                        ? 'bg-ink-900 text-white shadow-soft'
                        : 'bg-white text-ink-700 ring-1 ring-ink-200 hover:ring-lilac-300'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* quantity + add */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1 rounded-full bg-white ring-1 ring-ink-200">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center rounded-full text-ink-600 hover:bg-cream-100"
                aria-label="Diminuir quantidade"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold text-ink-900">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-11 w-11 place-items-center rounded-full text-ink-600 hover:bg-cream-100"
                aria-label="Aumentar quantidade"
              >
                <Plus size={16} />
              </button>
            </div>

            <button onClick={handleAdd} className="btn-primary flex-1 py-3.5">
              {added ? (
                <>
                  <Check size={18} /> Adicionado!
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> Comprar — {formatPrice(product.price * qty)}
                </>
              )}
            </button>

            <button
              onClick={() => toggleFavorite(product.id)}
              aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ring-1 transition-all ${
                fav
                  ? 'bg-rose-400 text-white ring-rose-400'
                  : 'bg-white text-ink-600 ring-ink-200 hover:text-rose-600'
              }`}
            >
              <Heart size={20} className={fav ? 'fill-white' : ''} />
            </button>
          </div>

          {/* reassurance */}
          <div className="mt-8 grid grid-cols-3 gap-3 rounded-3xl bg-white p-4 ring-1 ring-ink-100">
            {[
              { Icon: Truck, t: 'Envio 24-48h' },
              { Icon: RefreshCw, t: 'Trocas 30 dias' },
              { Icon: ShieldCheck, t: 'Pagamento seguro' },
            ].map(({ Icon, t }) => (
              <div key={t} className="flex flex-col items-center gap-1.5 text-center">
                <Icon size={18} className="text-lilac-600" />
                <span className="text-[11px] font-medium text-ink-600">{t}</span>
              </div>
            ))}
          </div>

          {/* tabs */}
          <div className="mt-8">
            <div className="flex gap-1 border-b border-ink-100">
              {([
                ['desc', 'Descrição'],
                ['details', 'Detalhes'],
                ['reviews', `Avaliações (${product.reviewsCount})`],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
                    tab === key ? 'text-ink-900' : 'text-ink-400 hover:text-ink-600'
                  }`}
                >
                  {label}
                  {tab === key && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-lilac-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-5 text-sm leading-relaxed text-ink-600">
              {tab === 'desc' && <p>{product.description}</p>}
              {tab === 'details' && (
                <ul className="flex flex-col gap-2">
                  {product.details.map((d) => (
                    <li key={d} className="flex items-center gap-2.5">
                      <Check size={15} className="text-sky-600" /> {d}
                    </li>
                  ))}
                </ul>
              )}
              {tab === 'reviews' && <ReviewsBlock rating={product.rating} count={product.reviewsCount} />}
            </div>
          </div>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="reveal font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
            Também vais adorar
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ReviewsBlock({ rating, count }: { rating: number; count: number }) {
  const sample = [
    { name: 'Catarina F.', rating: 5, text: 'Qualidade incrível e entrega rápida. Recomendo!', date: 'Há 2 semanas' },
    { name: 'Rui M.', rating: 5, text: 'Exatamente como na foto. Tecido muito macio.', date: 'Há 1 mês' },
    { name: 'Ana P.', rating: 4, text: 'Linda peça, só achei o tamanho um pouco pequeno.', date: 'Há 2 meses' },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-cream-100 p-6 text-center sm:flex-row sm:justify-around sm:text-left">
        <div>
          <p className="font-display text-4xl font-semibold text-ink-900">{rating.toFixed(1)}</p>
          <StarRating rating={rating} size={16} className="mt-1" />
          <p className="mt-1 text-xs text-ink-500">{count} avaliações</p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const pct = star === 5 ? 82 : star === 4 ? 14 : star === 3 ? 3 : star === 2 ? 1 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-3 text-xs text-ink-500">{star}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-200">
                  <div className="h-full rounded-full bg-cream-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-xs text-ink-400">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <ul className="flex flex-col gap-4">
        {sample.map((r) => (
          <li key={r.name} className="rounded-2xl bg-white p-4 ring-1 ring-ink-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-lilac-100 font-display font-semibold text-lilac-700">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{r.name}</p>
                  <p className="text-xs text-ink-400">{r.date}</p>
                </div>
              </div>
              <StarRating rating={r.rating} size={13} />
            </div>
            <p className="mt-3 text-sm text-ink-600">{r.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
