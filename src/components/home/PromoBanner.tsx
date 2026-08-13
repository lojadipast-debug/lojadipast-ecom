import { ArrowRight, Sparkles, Tag, Clock } from 'lucide-react';
import { useRouter } from '@/store/router';

export function PromoBanner() {
  const { navigate } = useRouter();

  return (
    <section className="container-x mt-24">
      <div className="reveal grid gap-5 lg:grid-cols-3">
        {/* big promo */}
        <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-rose-200 via-cream-100 to-lilac-200 p-10 sm:p-12 lg:col-span-2">
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-rose-300/50 blur-3xl" />
          <div className="absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-lilac-300/50 blur-3xl" />
          {/* rotating badge */}
          <div className="absolute right-6 top-6 z-10 hidden h-16 w-16 animate-spin-slow items-center justify-center rounded-full bg-rose-500 text-white shadow-soft sm:flex">
            <div className="text-center leading-none">
              <div className="font-display text-base font-extrabold">-30%</div>
              <div className="text-[8px] font-bold uppercase tracking-wider">Oferta</div>
            </div>
          </div>
          <div className="relative flex flex-col items-start">
            <span className="chip inline-flex items-center gap-1.5 bg-white/70 ring-rose-300 text-rose-700">
              <Sparkles size={14} /> Oferta especial
            </span>
            <h3 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tighter2 text-ink-900 sm:text-5xl">
              Até 30% na coleção
              <br />
              de brinquedos suaves
            </h3>
            <p className="mt-4 max-w-sm text-ink-700">
              Pelúcias hipoalergénicas e companheiros macios, escolhidos para os primeiros abraços.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-rose-700">
              <Clock size={14} /> Só esta semana
            </div>
            <button
              onClick={() => navigate('/catalogo/brinquedos')}
              className="btn-primary group mt-5"
            >
              Ver brinquedos
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <img
            src="https://images.pexels.com/photos/1974656/pexels-photo-1974656.jpeg?auto=compress&cs=tinysrgb&h=420&w=420"
            alt="Pelúcias em fundo pastel"
            className="pointer-events-none absolute bottom-0 right-0 hidden h-52 w-52 translate-x-6 translate-y-4 rotate-6 object-cover rounded-tl-[5rem] rounded-br-[5rem] shadow-soft-lg lg:block"
          />
        </div>

        {/* small promo */}
        <div className="relative overflow-hidden rounded-5xl bg-sky-200 p-10">
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-sky-300/60 blur-2xl" />
          <span className="chip relative inline-flex items-center gap-1.5 bg-white/70 ring-sky-300 text-sky-700">
            <Tag size={14} /> Novo
          </span>
          <h3 className="relative mt-4 font-display text-3xl font-extrabold leading-tight tracking-tighter2 text-ink-900">
            Mochilas para o regresso às aulas
          </h3>
          <p className="relative mt-3 text-sm text-ink-700">
            Leves, ergonómicas e com o coelhinho Dipa.
          </p>
          <button
            onClick={() => navigate('/catalogo/mochilas')}
            className="group relative mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-sky-700 transition-all hover:gap-3"
          >
            Descobrir <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <img
            src="https://images.pexels.com/photos/4910563/pexels-photo-4910563.jpeg?auto=compress&cs=tinysrgb&h=320&w=320"
            alt=""
            className="pointer-events-none absolute -right-4 bottom-0 h-28 w-28 rotate-12 rounded-2xl object-cover opacity-90 shadow-soft"
          />
        </div>
      </div>
    </section>
  );
}
