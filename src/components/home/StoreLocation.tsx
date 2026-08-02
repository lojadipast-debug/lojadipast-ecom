import { MapPin, Clock } from 'lucide-react';
import lojaImg from './loja.png';

export function StoreLocation() {
  return (
    <section className="container-x mt-24">
      <div className="reveal overflow-hidden rounded-4xl bg-cream-100 lg:grid lg:grid-cols-2">
        <div className="relative h-72 overflow-hidden lg:h-auto">
          <img
            src={lojaImg}
            alt="Loja Dipa em Santo Tirso"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/30 to-transparent" />
        </div>

        <div className="flex flex-col justify-center gap-6 p-8 sm:p-12">
          <div>
            <p className="section-eyebrow">Visita-nos</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tighter2 text-ink-900 sm:text-5xl">
              A nossa loja
            </h2>
            <p className="mt-3 text-ink-600">
              Vem descobrir pessoalmente tudo o que temos para os mais pequenos. A nossa equipa está à espera de ti!
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-lilac-100 text-lilac-600">
                <MapPin size={18} />
              </span>
              <div>
                <p className="font-bold text-ink-900">Morada</p>
                <p className="text-sm text-ink-600">R. Dr. António Augusto Pires de Lima 3</p>
                <p className="text-sm text-ink-600">4780-443 Santo Tirso</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-lilac-100 text-lilac-600">
                <Clock size={18} />
              </span>
              <div>
                <p className="font-bold text-ink-900">Horário</p>
                <p className="text-sm text-ink-600">Segunda a Sexta: 9h30 – 19h00</p>
                <p className="text-sm text-ink-600">Sábado: 9h30 – 13h00</p>
              </div>
            </div>
          </div>

          <a
            href="https://maps.google.com/?q=R.+Dr.+António+Augusto+Pires+de+Lima+3,+4780-443+Santo+Tirso"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary self-start"
          >
            <MapPin size={16} /> Ver no mapa
          </a>
        </div>
      </div>
    </section>
  );
}
