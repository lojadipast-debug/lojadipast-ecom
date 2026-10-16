import { Instagram, Facebook } from 'lucide-react';

function TikTokIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 3c.3 2.3 1.6 3.8 3.8 4v2.7c-1.3.1-2.5-.2-3.8-.8v5.9c0 4.1-3.3 6.7-6.8 5.6-3.6-1.1-4.4-5.6-1.4-7.9 1.1-.8 2.4-1 3.7-.7v2.9c-.7-.2-1.4-.1-2 .3-1.4.9-1 3.2.7 3.5 1.3.3 2.5-.7 2.5-2.1V3h3.3z" />
    </svg>
  );
}

const SOCIALS = [
  {
    icon: <Instagram size={28} />,
    name: 'Instagram',
    handle: '@lojas_dipa',
    desc: 'Inspira-te com as nossas novidades e looks do dia a dia.',
    href: 'https://www.instagram.com/lojas_dipa/',
    color: 'from-rose-400 to-pink-500',
    ring: 'ring-rose-200',
    text: 'text-rose-500',
    bg: 'bg-rose-50',
  },
  {
    icon: <Facebook size={28} />,
    name: 'Facebook',
    handle: 'Dipa',
    desc: 'Promoções exclusivas e novidades em primeira mão.',
    href: 'https://www.facebook.com/profile.php?id=61579285052792&locale=pt_PT',
    color: 'from-blue-500 to-blue-600',
    ring: 'ring-blue-200',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: <TikTokIcon />,
    name: 'TikTok',
    handle: '@dipa.sts',
    desc: 'Vídeos divertidos e tendências direto da nossa loja.',
    href: 'https://www.tiktok.com/@dipa.sts',
    color: 'from-ink-800 to-ink-900',
    ring: 'ring-ink-200',
    text: 'text-ink-800',
    bg: 'bg-ink-50',
  },
];

export function SocialFollow() {
  return (
    <section className="container-x mt-24">
      <div className="reveal text-center">
        <p className="section-eyebrow">Redes Sociais</p>
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tighter2 text-ink-900 sm:text-5xl">
          Segue-nos!
        </h2>
        <p className="mx-auto mt-3 max-w-md text-ink-600">
          Fica a par de tudo: novidades, promoções e momentos especiais.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {SOCIALS.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`reveal group flex flex-col gap-4 rounded-4xl ${s.bg} p-8 ring-1 ${s.ring} transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-xl`}
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${s.color} text-white shadow-md`}>
              {s.icon}
            </div>
            <div>
              <p className={`font-display text-xl font-extrabold ${s.text}`}>{s.name}</p>
              <p className="text-sm font-semibold text-ink-500">{s.handle}</p>
              <p className="mt-2 text-sm text-ink-600">{s.desc}</p>
            </div>
            <span className={`mt-auto inline-flex items-center gap-1.5 text-sm font-bold ${s.text} transition-gap duration-200 group-hover:gap-3`}>
              Seguir →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
