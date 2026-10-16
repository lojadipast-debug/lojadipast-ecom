import { ArrowRight } from 'lucide-react';
import { useRouter } from '@/store/router';
import { CATEGORY_LABELS } from '@/data/catalog';
import type { Category } from '@/data/catalog';

const CATEGORIES: { key: Category; img: string; tag: string }[] = [
  { key: 'bebe', img: 'https://images.pexels.com/photos/29562273/pexels-photo-29562273.jpeg?auto=compress&cs=tinysrgb&h=780&w=560', tag: '0–24 meses' },
  { key: 'menina', img: 'https://images.pexels.com/photos/27816523/pexels-photo-27816523.jpeg?auto=compress&cs=tinysrgb&h=780&w=560', tag: '2–10 anos' },
  { key: 'menino', img: 'https://images.pexels.com/photos/6170770/pexels-photo-6170770.jpeg?auto=compress&cs=tinysrgb&h=780&w=560', tag: '2–10 anos' },
  { key: 'mochilas', img: 'https://images.pexels.com/photos/4910563/pexels-photo-4910563.jpeg?auto=compress&cs=tinysrgb&h=780&w=560', tag: 'Para a escola' },
  { key: 'brinquedos', img: 'https://images.pexels.com/photos/1974656/pexels-photo-1974656.jpeg?auto=compress&cs=tinysrgb&h=780&w=560', tag: 'Pelúcias & jogos' },
  { key: 'acessorios', img: 'https://images.pexels.com/photos/4987523/pexels-photo-4987523.jpeg?auto=compress&cs=tinysrgb&h=780&w=560', tag: 'Complementos' },
];

export function CategoryGrid() {
  const { navigate } = useRouter();

  return (
    <section className="container-x mt-24">
      <div className="reveal flex items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Explorar</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tighter2 text-ink-900 sm:text-5xl">
            Categorias com carinho
          </h2>
        </div>
        <button
          onClick={() => navigate('/catalogo')}
          className="group hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink-700 ring-1 ring-ink-200 transition-all hover:gap-3 hover:bg-lilac-100 hover:text-lilac-700 sm:flex"
        >
          Ver tudo <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.key}
            onClick={() => navigate(`/catalogo/${cat.key}`)}
            className="reveal group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-4xl ring-1 ring-ink-100/60"
            style={{ transitionDelay: `${i * 70}ms` }}
          >
            <img
              src={cat.img}
              alt={CATEGORY_LABELS[cat.key]}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/10 to-transparent transition-opacity duration-500 group-hover:from-ink-900/80" />

            <div className="relative z-10 flex w-full flex-col gap-1 p-5 text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 transition-colors group-hover:text-cream-300">
                {cat.tag}
              </span>
              <span className="font-display text-xl font-extrabold text-white">
                {CATEGORY_LABELS[cat.key]}
              </span>
              <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-lilac-200 opacity-0 transition-all duration-300 group-hover:opacity-100">
                Ver coleção <ArrowRight size={12} />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
