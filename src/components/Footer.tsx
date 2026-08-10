import { useState } from 'react';
import { Instagram, Facebook, Mail, Heart, ArrowRight, Check, Phone } from 'lucide-react';
import { DipaLogo } from './DipaLogo';
import { useRouter } from '@/store/router';

const SOCIAL = [
  { Icon: Instagram, label: 'Instagram @lojas_dipa', href: 'https://www.instagram.com/lojas_dipa/' },
  { Icon: Facebook, label: 'Facebook Dipa', href: 'https://www.facebook.com/profile.php?id=61579285052792&locale=pt_PT' },
] as const;

const LINKS = [
  {
    title: 'Loja',
    items: [
      { label: 'Bebé', to: '/catalogo/bebe' },
      { label: 'Menina', to: '/catalogo/menina' },
      { label: 'Menino', to: '/catalogo/menino' },
      { label: 'Mochilas', to: '/catalogo/mochilas' },
      { label: 'Brinquedos', to: '/catalogo/brinquedos' },
      { label: 'Acessórios', to: '/catalogo/acessorios' },
    ],
  },
  {
    title: 'Apoio',
    items: [
      { label: 'Sobre Nós', to: '/sobre' },
      { label: 'Envios', to: '/envios' },
      { label: 'Trocas e Devoluções', to: '/trocas' },
      { label: 'Contactos', to: '/contactos' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Política de Privacidade', to: '/privacidade' },
      { label: 'Termos', to: '/termos' },
      { label: 'A minha conta', to: '/conta/perfil' },
    ],
  },
];

export function Footer() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 3500);
  };

  return (
    <footer className="mt-24 bg-cream-100">
      {/* newsletter band */}
      <div className="container-x pt-8">
        <div className="reveal relative overflow-hidden rounded-6xl bg-gradient-to-br from-lilac-200 via-cream-100 to-sky-200 p-10 sm:p-14 lg:p-20">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-lilac-300/50 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-sky-300/50 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="section-eyebrow">Newsletter</p>
              <h3 className="mt-3 font-display text-4xl font-extrabold tracking-tighter2 text-ink-900 sm:text-5xl">
                Recebe novidades com carinho
              </h3>
              <p className="mt-4 max-w-md text-ink-700">
                Subscreve e fica a primeiro saber das novas coleções, promoções e histórias
                detrás de cada peça. 10% na primeira compra.
              </p>
            </div>
            <form onSubmit={submit} className="flex w-full flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="O teu email"
                className="input-field flex-1 border-transparent bg-white/85 text-base"
              />
              <button type="submit" className="btn-primary shrink-0 text-base">
                {sent ? (
                  <>
                    <Check size={18} /> Subscrito!
                  </>
                ) : (
                  <>
                    Subscrever <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* links */}
      <div className="container-x mt-16 grid gap-10 border-t border-ink-100 pt-14 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <DipaLogo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-600">
            Tudo para os mais pequenos, escolhido com carinho. Roupa, brinquedos, mochilas e
            acessórios de qualidade premium para acompanhar a infância.
          </p>
          {/* contact info */}
          <div className="mt-5 flex flex-col gap-2 text-sm text-ink-600">
            <a href="tel:+351933968223" className="flex items-center gap-2 transition-colors hover:text-lilac-700">
              <Phone size={15} className="shrink-0 text-lilac-500" /> +351 933 968 223
            </a>
            <a href="mailto:lojadipast@gmail.com" className="flex items-center gap-2 transition-colors hover:text-lilac-700">
              <Mail size={15} className="shrink-0 text-lilac-500" /> lojadipast@gmail.com
            </a>
          </div>

          <div className="mt-6 flex gap-2">
            {SOCIAL.map(({ Icon, label, href }) => (
              <SocialLink key={label} Icon={Icon} label={label} href={href} />
            ))}
            <TikTokLink />
          </div>
        </div>

        {LINKS.map((group) => (
          <div key={group.title}>
            <h4 className="font-display text-sm font-extrabold uppercase tracking-wider text-ink-900">
              {group.title}
            </h4>
            <ul className="mt-5 flex flex-col gap-3">
              {group.items.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.to)}
                    className="group flex items-center gap-1.5 text-sm text-ink-600 transition-colors hover:text-lilac-700"
                  >
                    <span className="h-px w-0 bg-lilac-500 transition-all duration-300 group-hover:w-3" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* bottom bar */}
      <div className="container-x mt-14 flex flex-col items-center justify-between gap-4 border-t border-ink-100 py-7 text-xs font-medium text-ink-500 sm:flex-row">
        <p>© {new Date().getFullYear()} Dipa. Feito com carinho em Portugal.</p>
        <p className="flex items-center gap-1.5">
          Desenhado com <Heart size={12} className="fill-rose-400 text-rose-400" /> para a infância
        </p>
        <button
          onClick={() => navigate('/admin')}
          className="text-ink-300 transition-colors hover:text-ink-500"
          aria-label="Painel de administração"
          title="Admin"
        >
          Admin
        </button>
      </div>
    </footer>
  );
}

function SocialLink({ Icon, label, href }: { Icon: typeof Instagram; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-600 ring-1 ring-ink-100 transition-all duration-300 hover:-translate-y-1 hover:bg-lilac-200 hover:text-lilac-700"
    >
      <Icon size={18} />
    </a>
  );
}

function TikTokLink() {
  return (
    <a
      href="https://www.tiktok.com/@dipa.sts"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="TikTok"
      className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-600 ring-1 ring-ink-100 transition-all duration-300 hover:-translate-y-1 hover:bg-lilac-200 hover:text-lilac-700"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.5 3c.3 2.3 1.6 3.8 3.8 4v2.7c-1.3.1-2.5-.2-3.8-.8v5.9c0 4.1-3.3 6.7-6.8 5.6-3.6-1.1-4.4-5.6-1.4-7.9 1.1-.8 2.4-1 3.7-.7v2.9c-.7-.2-1.4-.1-2 .3-1.4.9-1 3.2.7 3.5 1.3.3 2.5-.7 2.5-2.1V3h3.3z" />
      </svg>
    </a>
  );
}
