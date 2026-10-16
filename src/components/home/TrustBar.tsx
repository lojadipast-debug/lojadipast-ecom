import { Truck, ShieldCheck, RefreshCw, HeartHandshake } from 'lucide-react';

const ITEMS = [
  { Icon: Truck, title: 'Envios rápidos', text: 'Grátis acima de 50€ · 24-48h', tone: 'text-lilac-700 bg-lilac-200' },
  { Icon: RefreshCw, title: 'Trocas fáceis', text: '30 dias para trocar sem custo', tone: 'text-sky-700 bg-sky-200' },
  { Icon: ShieldCheck, title: 'Pagamento seguro', text: 'Encriptação SSL e métodos fiáveis', tone: 'text-rose-700 bg-rose-200' },
  { Icon: HeartHandshake, title: 'Carinho em cada peça', text: 'Materiais certificados e suaves', tone: 'text-cream-800 bg-cream-300' },
];

export function TrustBar() {
  return (
    <section className="container-x mt-20">
      <div className="reveal grid gap-4 rounded-5xl bg-white p-7 ring-1 ring-ink-100/60 shadow-soft sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ Icon, title, text, tone }, i) => (
          <div
            key={title}
            className="group flex items-center gap-4 rounded-3xl p-2 transition-colors hover:bg-cream-100"
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${tone} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="font-display text-sm font-extrabold text-ink-900">{title}</p>
              <p className="mt-0.5 text-xs font-medium text-ink-500">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
