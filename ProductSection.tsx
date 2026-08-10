import { useState } from 'react';
import { ArrowRight, Flame, Tag } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useRouter } from '@/store/router';
import { PRODUCTS } from '@/data/catalog';

interface Props {
  title: string;
  eyebrow: string;
  filter: 'isFeatured' | 'isNew' | 'isPromo';
  cta?: string;
  ctaTo?: string;
}

export function ProductSection({ title, eyebrow, filter, cta, ctaTo }: Props) {
  const { navigate } = useRouter();
  const products = PRODUCTS.filter((p) => p[filter]).slice(0, 8);
  const [tab, setTab] = useState(0);
  const isPromo = filter === 'isPromo';

  return (
    <section className="container-x mt-24">
      {isPromo ? (
        <div className="reveal relative overflow-hidden rounded-4xl bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 p-8 sm:p-10">
          {/* glow blobs */}
          <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-amber-300/40 blur-2xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              {/* fire icon block */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30 shadow-soft-lg">
                <Flame size={30} className="text-white drop-shadow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/90 ring-1 ring-white/30">
                    <Tag size={11} /> {eyebrow}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tighter2 text-white drop-shadow sm:text-5xl">
                  {title}
                </h2>
                <p className="mt-1 text-sm font-medium text-white/80">
                  Ofertas imperdíveis por tempo limitado
                </p>
              </div>
            </div>
            {cta && ctaTo && (
              <button
                onClick={() => navigate(ctaTo)}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-rose-600 shadow-soft-lg transition-all hover:gap-3 hover:shadow-soft-xl active:scale-[0.97]"
              >
                {cta} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="reveal flex items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow">{eyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tighter2 text-ink-900 sm:text-5xl">
              {title}
            </h2>
          </div>
          {cta && ctaTo && (
            <button
              onClick={() => navigate(ctaTo)}
              className="group hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink-700 ring-1 ring-ink-200 transition-all hover:gap-3 hover:bg-lilac-100 hover:text-lilac-700 sm:flex"
            >
              {cta} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      )}

      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {products.slice(tab * 4, tab * 4 + 4).map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>

      {products.length > 4 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: Math.ceil(products.length / 4) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              aria-label={`Página ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-400 ${
                tab === i ? 'w-10 bg-lilac-600' : 'w-2 bg-ink-200 hover:bg-ink-300'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
