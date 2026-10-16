import { useState, useEffect } from 'react';
import { Instagram, Facebook, Mail, Heart, ArrowRight, Check, Phone, X, Shield } from 'lucide-react';
import { DipaLogo } from './DipaLogo';
import { useRouter } from '@/store/router';
import { useAccount } from '@/store/account';

const ADMIN_EMAIL = 'blegend1080@gmail.com';

const SOCIAL = [
  { Icon: Instagram, label: 'Instagram @lojas_dipa', href: 'https://www.instagram.com/lojas_dipa/' },
  { Icon: Facebook, label: 'Facebook Dipa', href: 'https://www.facebook.com/profile.php?id=61579285052792&locale=pt_PT' },
] as const;

const INFO_CONTENT: Record<string, { title: string; body: React.ReactNode }> = {
  sobre: {
    title: 'Sobre Nós',
    body: (
      <>
        <p>A Dipa nasceu do amor pelos mais pequenos. Somos uma loja portuguesa dedicada a roupa, brinquedos, mochilas e acessórios infantis de qualidade premium, pensados para acompanhar cada fase da infância com conforto e carinho.</p>
        <p>Trabalhamos com materiais certificados, algodões orgânicos e tecidos suaves, sempre com atenção aos detalhes que fazem a diferença: costuras planas, botões de pressão seguros e acabamentos impecáveis.</p>
        <p>A nossa missão é simples: oferecer aos pais produtos em que podem confiar, e às crianças peças que adoram usar.</p>
      </>
    ),
  },
  envios: {
    title: 'Envios',
    body: (
      <>
        <p><strong>Envio Standard (24-48h)</strong> — Grátis para encomendas acima de 50€. Para valores inferiores, o custo é de 4,90€.</p>
        <p><strong>Envio Express (24h)</strong> — 9,90€. Entrega prioritária em Portugal Continental.</p>
        <p>Encomendas processadas até às 15h são enviadas no mesmo dia útil. Ilhas (Madeira e Açores) podem ter 1-2 dias adicionais.</p>
        <p>Receberás um email com o número de seguimento assim que a encomenda for expedida.</p>
      </>
    ),
  },
  trocas: {
    title: 'Trocas e Devoluções',
    body: (
      <>
        <p>Tens 30 dias para efetuar trocas ou devoluções a contar da data de receção da encomenda.</p>
        <p><strong>Devoluções:</strong> Os artigos devem estar em estado novo, sem uso e com etiquetas. O reembolso é processado no método de pagamento original em 5-7 dias úteis.</p>
        <p><strong>Trocas:</strong> Podes trocar por outro tamanho ou cor sem custos de envio adicional.</p>
        <p>Para iniciar uma devolução ou troca, contacta-nos através do email lojadipast@gmail.com com o número da encomenda.</p>
      </>
    ),
  },
  contactos: {
    title: 'Contactos',
    body: (
      <>
        <p>Estamos aqui para ajudar! Contacta-nos através de qualquer um dos canais abaixo:</p>
        <p><strong>Telefone:</strong> +351 933 968 223</p>
        <p><strong>Email:</strong> lojadipast@gmail.com</p>
        <p><strong>Instagram:</strong> @lojas_dipa</p>
        <p><strong>Facebook:</strong> Dipa</p>
        <p><strong>Horário de atendimento:</strong> Segunda a Sábado, 9h às 18h.</p>
      </>
    ),
  },
  privacidade: {
    title: 'Política de Privacidade',
    body: (
      <>
        <p>A Dipa respeita a tua privacidade. Os dados pessoais recolhidos (nome, email, morada, telefone, NIF) são utilizados exclusivamente para processar encomendas, comunicações de serviço e melhorar a tua experiência de compra.</p>
        <p>Não partilhamos os teus dados com terceiros para fins comerciais. Os dados são armazenados de forma segura e podes solicitar o acesso, retificação ou eliminação dos mesmos a qualquer momento.</p>
        <p>Ao criares uma conta ou efetuares uma compra, aceitas a recolha e uso dos teus dados conforme descrito.</p>
      </>
    ),
  },
  termos: {
    title: 'Termos e Condições',
    body: (
      <>
        <p>A utilização deste site implica a aceitação dos presentes termos. Todos os produtos apresentados estão sujeitos a disponibilidade de stock.</p>
        <p>Os preços apresentados incluem IVA à taxa legal em vigor. A Dipa reserva-se o direito de alterar preços e promoções sem aviso prévio.</p>
        <p>As encomendas estão sujeitas a confirmação de pagamento. Em caso de falha de pagamento, a encomenda será cancelada automaticamente.</p>
        <p>Para qualquer disputa, aplica-se a legislação portuguesa e a jurisdição dos tribunais de Portugal.</p>
      </>
    ),
  },
};

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
      { label: 'Sobre Nós', modalKey: 'sobre' },
      { label: 'Envios', modalKey: 'envios' },
      { label: 'Trocas e Devoluções', modalKey: 'trocas' },
      { label: 'Contactos', modalKey: 'contactos' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Política de Privacidade', modalKey: 'privacidade' },
      { label: 'Termos', modalKey: 'termos' },
      { label: 'A minha conta', to: '/conta/perfil' },
    ],
  },
];

export function Footer() {
  const { navigate } = useRouter();
  const { user } = useAccount();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [modalKey, setModalKey] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 3500);
  };

  useEffect(() => {
    if (!modalKey) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalKey(null); };
    window.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [modalKey]);

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
                    onClick={() => 'modalKey' in item && item.modalKey ? setModalKey(item.modalKey) : navigate(item.to!)}
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

      {/* Info modal */}
      {modalKey && INFO_CONTENT[modalKey] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setModalKey(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-8 shadow-soft-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-2xl font-bold text-ink-900">{INFO_CONTENT[modalKey].title}</h3>
              <button
                onClick={() => setModalKey(null)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream-100 text-ink-500 transition-colors hover:bg-ink-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink-700">
              {INFO_CONTENT[modalKey].body}
            </div>
          </div>
        </div>
      )}

      {/* bottom bar */}
      <div className="container-x mt-14 flex flex-col items-center justify-between gap-4 border-t border-ink-100 py-7 text-xs font-medium text-ink-500 sm:flex-row">
        <div className="flex items-center gap-3">
          <p>© {new Date().getFullYear()} Dipa. Feito com carinho em Portugal.</p>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-1.5 rounded-full bg-lilac-100 px-3 py-1.5 text-xs font-bold text-lilac-700 ring-1 ring-lilac-200 transition-all hover:bg-lilac-200 hover:ring-lilac-300"
              aria-label="Painel de administração"
              title="Painel de administração"
            >
              <Shield size={13} />
              Admin
            </button>
          )}
        </div>
        <p className="flex items-center gap-1.5">
          Desenhado com <Heart size={12} className="fill-rose-400 text-rose-400" /> para a infância
        </p>
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
