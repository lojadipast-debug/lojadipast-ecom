import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from '@/store/router';

export function Hero() {
  const { navigate } = useRouter();

  return (
    <section className="relative w-full">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/18447782/pexels-photo-18447782.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Crianças felizes a brincar num dia de sol"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream-100 via-cream-100/85 to-cream-100/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/35 via-transparent to-transparent" />
      </div>

      <div className="pointer-events-none absolute right-[18%] top-[22%] hidden h-32 w-32 animate-float rounded-full bg-lilac-300/40 blur-2xl lg:block" />
      <div className="pointer-events-none absolute right-[8%] bottom-[28%] hidden h-40 w-40 animate-float-soft rounded-full bg-rose-300/40 blur-3xl lg:block" />
      <Sparkles className="pointer-events-none absolute right-[14%] top-[16%] hidden animate-float text-lilac-400/90 lg:block" size={30} />

      <div className="container-x relative grid min-h-[88vh] items-center py-20 lg:py-28">
        <div className="max-w-2xl">
          <span className="inline-flex animate-fade-up items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-lilac-700 ring-1 ring-lilac-200 backdrop-blur-md">
            <Sparkles size={14} /> Nova coleção · Primavera
          </span>

          <h1 className="mt-6 animate-fade-up font-display text-[3.4rem] font-extrabold leading-[0.98] tracking-tighter2 text-ink-900 text-balance [animation-delay:0.1s] sm:text-7xl lg:text-[5.4rem]">
            Tudo para os
            <br />
            <span className="text-shimmer">mais pequenos</span>
          </h1>

          <p className="mt-6 max-w-lg animate-fade-up text-lg leading-relaxed text-ink-700 text-pretty [animation-delay:0.2s]">
            Roupa, brinquedos, mochilas e acessórios escolhidos com carinho. Qualidade premium
            para acompanhar cada etapa da infância.
          </p>

          <div className="mt-9 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:0.3s]">
            <button onClick={() => navigate('/catalogo')} className="btn-primary text-base">
              Comprar Agora <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/catalogo/bebe')}
              className="btn-soft bg-white/70 backdrop-blur-md"
            >
              Coleção Bebé
            </button>
          </div>

        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ink-600 lg:flex">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Descobrir</span>
        <span className="flex h-9 w-5 justify-center rounded-full border-2 border-ink-400 p-1">
          <span className="h-2 w-1 animate-float-soft rounded-full bg-ink-500" />
        </span>
      </div>
    </section>
  );
}
