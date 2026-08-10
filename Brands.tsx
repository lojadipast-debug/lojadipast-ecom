const BRANDS = [
  { name: 'Dipa Soft', tag: 'O nosso selo' },
  { name: 'Petit Coton', tag: 'Algodões finos' },
  { name: 'Nuage', tag: 'Tricot macio' },
  { name: 'Bulle & Co', tag: 'Acessórios' },
  { name: 'Lapin Bleu', tag: 'Pelúcias' },
  { name: 'Maison Douce', tag: 'Essenciais' },
];

export function Brands() {
  // duplicate for seamless marquee
  const loop = [...BRANDS, ...BRANDS];

  return (
    <section className="mt-24 overflow-hidden border-y border-ink-100 bg-cream-100 py-14">
      <div className="container-x reveal text-center">
        <p className="section-eyebrow">Marcas que amamos</p>
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tighter2 text-ink-900 sm:text-5xl">
          Selecionadas a dedo
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-ink-600">
          Trabalhamos com marcas que partilham os nossos valores de qualidade, conforto e carinho.
        </p>
      </div>

      <div className="reveal mt-10 mask-fade-x">
        <div className="flex w-max animate-marquee pause-on-hover items-center gap-6">
          {loop.map((brand, i) => (
            <div
              key={`${brand.name}-${i}`}
              className="flex w-64 shrink-0 flex-col items-center gap-1 rounded-3xl bg-white px-8 py-7 text-center ring-1 ring-ink-100/50 shadow-soft transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="font-display text-xl font-extrabold text-ink-900">{brand.name}</span>
              <span className="text-xs font-medium text-ink-500">{brand.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
