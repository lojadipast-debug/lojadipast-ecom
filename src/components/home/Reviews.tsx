import { Star, Quote } from 'lucide-react';
import { REVIEWS } from '@/data/catalog';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function Reviews() {
  useScrollReveal();
  return (
    <section className="container-x mt-24">
      <div className="reveal text-center">
        <p className="section-eyebrow">Avaliações</p>
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tighter2 text-ink-900 sm:text-5xl">
          Famílias felizes
        </h2>
        <div className="mt-4 flex items-center justify-center gap-2.5">
          <span className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={20} className="fill-cream-400 text-cream-400" />
            ))}
          </span>
          <span className="text-sm font-bold text-ink-700">
            4.9/5 · mais de 2 400 avaliações
          </span>
        </div>
      </div>

      <div className="reveal mask-fade-x mt-10 overflow-x-auto pb-4 no-scrollbar">
        <div className="flex gap-5 px-6">
          {REVIEWS.map((review) => (
            <figure
              key={review.id}
              className="group flex w-[20rem] shrink-0 flex-col gap-4 rounded-4xl bg-white p-7 ring-1 ring-ink-100/60 shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-soft-lg"
            >
              <div className="flex items-center justify-between">
                <Quote size={26} className="text-lilac-300 transition-colors group-hover:text-lilac-400" />
                <span className="flex">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-cream-400 text-cream-400" />
                  ))}
                </span>
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-ink-700">
                "{review.text}"
              </blockquote>
              <figcaption className="flex items-center gap-3 border-t border-ink-100 pt-4">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-lilac-300 to-rose-300 font-display font-extrabold text-ink-900">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-900">{review.name}</p>
                  <p className="text-xs text-ink-500">{review.location} · {review.product}</p>
                </div>
              </figcaption>
            </figure>
          ))}
          <div className="w-2 shrink-0" aria-hidden />
        </div>
      </div>
    </section>
  );
}
