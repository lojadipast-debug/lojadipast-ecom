import { useEffect, useState } from 'react';
import { Search, Heart, User, ShoppingBag, Menu, X, ChevronRight, Phone, Instagram, Facebook } from 'lucide-react';
import { DipaLogo } from './DipaLogo';
import { useRouter } from '@/store/router';
import { useCart } from '@/store/cart';
import { useAccount } from '@/store/account';
import { CATEGORY_LABELS, PRODUCTS, formatPrice } from '@/data/catalog';
import type { Category } from '@/data/catalog';

const NAV: { key: Category | 'novidades' | 'promocoes'; label: string }[] = [
  { key: 'promocoes', label: 'Promoções' },
  { key: 'bebe', label: 'Bebé' },
  { key: 'menina', label: 'Menina' },
  { key: 'menino', label: 'Menino' },
  { key: 'mochilas', label: 'Mochilas' },
  { key: 'brinquedos', label: 'Brinquedos' },
  { key: 'acessorios', label: 'Acessórios' },
  { key: 'novidades', label: 'Novidades' },
];

const SUBCATEGORIES: Record<Category, string[]> = {
  bebe: ['Bodies', 'Conjuntos', 'Camisolas', 'Mantas', 'Calçado', 'Acessórios'],
  menina: ['T-shirts', 'Vestidos', 'Camisolas', 'Saias', 'Calçado', 'Acessórios'],
  menino: ['T-shirts', 'Camisolas', 'Calças', 'Conjuntos', 'Calçado', 'Acessórios'],
  mochilas: ['Escola', 'Viagem', 'Lancheira', 'Acessórios'],
  brinquedos: ['Pelúcias', 'Educativos', 'Livros', 'Madeira'],
  acessorios: ['Calçado', 'Mantas', 'Laços', 'Chapeus', 'Meias'],
};

const ANNOUNCE = ['Envios grátis acima de 50€', 'Trocas fáceis em 30 dias', 'Feito com carinho para os mais pequenos', '10% na primeira compra com DIPA10'];

export function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { navigate, path } = useRouter();
  const { cartCount, favorites, openCart } = useCart();
  const { user } = useAccount();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaKey, setMegaKey] = useState<Category | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaKey(null);
  }, [path]);

  const go = (to: string) => {
    navigate(to);
    setMobileOpen(false);
  };

  return (
    <>
      {/* announcement marquee — brand lilac */}
      <div className="relative z-50 overflow-hidden bg-lilac-200 text-ink-900">
        <div className="flex">
          <div className="flex shrink-0 animate-marquee items-center py-2 text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center gap-10">
                {ANNOUNCE.map((a) => (
                  <span key={a} className="flex items-center gap-10">
                    <span>{a}</span>
                    <span aria-hidden className="text-lilac-500">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
          <div
            className="flex shrink-0 animate-marquee items-center py-2 text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap"
            aria-hidden="true"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center gap-10">
                {ANNOUNCE.map((a) => (
                  <span key={a} className="flex items-center gap-10">
                    <span>{a}</span>
                    <span aria-hidden className="text-lilac-500">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-cream-100/80 shadow-soft backdrop-blur-2xl'
            : 'bg-cream-100/30 backdrop-blur-lg'
        }`}
      >
        <div className="container-x">
          <div className="flex h-18 items-center justify-between gap-4 lg:h-22">
            {/* left */}
            <div className="flex items-center gap-3">
              <button
                className="grid h-10 w-10 place-items-center rounded-full text-ink-700 transition-colors hover:bg-lilac-100 lg:hidden"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <button onClick={() => go('/')} aria-label="Dipa — início" className="transition-transform duration-300 hover:scale-[1.03] active:scale-95">
                <DipaLogo />
              </button>
            </div>

            {/* center nav */}
            <nav className="hidden items-center gap-0.5 lg:flex">
              {NAV.map((item) => {
                const isCat = item.key in CATEGORY_LABELS;
                const target = `/catalogo/${item.key}`;
                return (
                  <div
                    key={item.key}
                    className="relative"
                    onMouseEnter={() => setMegaKey(isCat ? (item.key as Category) : null)}
                    onMouseLeave={() => setMegaKey(null)}
                  >
                    <button
                      onClick={() => go(target)}
                      className={
                        item.key === 'promocoes'
                          ? 'group relative rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-4 py-2 text-sm font-extrabold text-white shadow-md transition-all hover:from-rose-600 hover:to-orange-500 hover:shadow-lg active:scale-95'
                          : 'group relative rounded-full px-3.5 py-2 text-sm font-bold text-ink-700 transition-colors hover:text-lilac-700'
                      }
                    >
                      {item.label}
                      {item.key !== 'promocoes' && (
                        <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-lilac-500 transition-transform duration-300 group-hover:scale-x-100" />
                      )}
                    </button>

                    {megaKey === item.key && isCat && (
                      <MegaMenu category={item.key as Category} onNavigate={go} />
                    )}
                  </div>
                );
              })}
            </nav>

            {/* actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <IconBtn onClick={onOpenSearch} label="Pesquisar" hoverLilac>
                <Search size={19} />
              </IconBtn>
              <IconBtn onClick={() => go('/conta/favoritos')} label="Favoritos" hoverRose className="relative hidden sm:grid">
                <Heart size={19} />
                {favorites.length > 0 && (
                  <Badge className="bg-rose-400">{favorites.length}</Badge>
                )}
              </IconBtn>
              <IconBtn onClick={() => go(user ? '/conta/perfil' : '/conta/login')} label="Conta" hoverSky>
                <User size={19} />
              </IconBtn>
              <IconBtn onClick={openCart} label="Carrinho" hoverCream className="relative">
                <ShoppingBag size={19} />
                {cartCount > 0 && (
                  <Badge className="bg-lilac-600">{cartCount}</Badge>
                )}
              </IconBtn>
            </div>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm animate-slide-in-right overflow-y-auto bg-cream-100 p-6 shadow-soft-lg">
            <div className="flex items-center justify-between">
              <DipaLogo />
              <button
                onClick={() => setMobileOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-ink-50"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              {NAV.map((item) => (
                <button
                  key={item.key}
                  onClick={() => go(`/catalogo/${item.key}`)}
                  className={
                    item.key === 'promocoes'
                      ? 'group flex items-center justify-between rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400 px-4 py-3.5 text-left font-display text-lg font-extrabold text-white transition-all hover:from-rose-600 hover:to-orange-500'
                      : 'group flex items-center justify-between rounded-2xl px-4 py-3.5 text-left font-display text-lg font-bold text-ink-800 transition-all hover:bg-lilac-100 hover:pl-6 hover:text-lilac-700'
                  }
                >
                  {item.label}
                  <ChevronRight size={18} className="text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-lilac-500" />
                </button>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-2 border-t border-ink-100 pt-6">
              <button onClick={() => go('/conta/favoritos')} className="btn-soft w-full">
                <Heart size={16} /> Favoritos
              </button>
              <button
                onClick={() => go(user ? '/conta/perfil' : '/conta/login')}
                className="btn-soft w-full"
              >
                <User size={16} /> {user ? 'A minha conta' : 'Entrar / Criar conta'}
              </button>
            </div>
            {/* contact + socials */}
            <div className="mt-6 flex flex-col gap-3 border-t border-ink-100 pt-6">
              <a href="tel:+351933968223" className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                <Phone size={15} className="text-lilac-500" /> +351 933 968 223
              </a>
              <a href="mailto:lojadipast@gmail.com" className="text-sm font-semibold text-ink-700">
                lojadipast@gmail.com
              </a>
              <div className="flex gap-2">
                <a href="https://www.instagram.com/lojas_dipa/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink-600 ring-1 ring-ink-100 transition-all hover:bg-lilac-100 hover:text-lilac-700">
                  <Instagram size={18} />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61579285052792&locale=pt_PT" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink-600 ring-1 ring-ink-100 transition-all hover:bg-lilac-100 hover:text-lilac-700">
                  <Facebook size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  hoverLilac,
  hoverRose,
  hoverSky,
  hoverCream,
  className = '',
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  hoverLilac?: boolean;
  hoverRose?: boolean;
  hoverSky?: boolean;
  hoverCream?: boolean;
  className?: string;
}) {
  const hover = hoverLilac
    ? 'hover:bg-lilac-100 hover:text-lilac-700'
    : hoverRose
    ? 'hover:bg-rose-100 hover:text-rose-600'
    : hoverSky
    ? 'hover:bg-sky-100 hover:text-sky-700'
    : hoverCream
    ? 'hover:bg-cream-200 hover:text-ink-900'
    : '';
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`grid h-10 w-10 place-items-center rounded-full text-ink-700 transition-all duration-200 active:scale-90 ${hover} ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`absolute right-0 top-0 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold text-white ring-2 ring-cream-100 ${className}`}>
      {children}
    </span>
  );
}

function MegaMenu({ category, onNavigate }: { category: Category; onNavigate: (to: string) => void }) {
  const subs = SUBCATEGORIES[category] ?? [];
  return (
    <div className="absolute left-0 top-full z-50 pt-3">
      {/* invisible bridge so mouse can travel from button to panel */}
      <div className="absolute -top-3 left-0 h-3 w-full" />
      <div
        className="animate-dropdown min-w-[200px] overflow-hidden rounded-2xl bg-white py-2 shadow-[0_8px_32px_rgba(0,0,0,0.10)] ring-1 ring-ink-100/60"
        style={{ transformOrigin: 'top left' }}
      >
        {/* "Ver tudo" header row */}
        <button
          onClick={() => onNavigate(`/catalogo/${category}`)}
          className="group flex w-full items-center justify-between px-5 py-3 text-left"
        >
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-ink-400">
            Tudo em {CATEGORY_LABELS[category]}
          </span>
          <ChevronRight size={13} className="text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-lilac-500" />
        </button>

        <div className="mx-4 mb-1 h-px bg-ink-100" />

        {/* subcategory list */}
        <ul className="py-1">
          {subs.map((sub, i) => (
            <li key={sub}>
              <button
                onClick={() => onNavigate(`/catalogo/${category}`)}
                className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-lilac-50"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <span className="text-sm font-semibold text-ink-700 transition-colors group-hover:text-lilac-700">
                  {sub}
                </span>
                <ChevronRight size={13} className="ml-auto text-ink-200 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-lilac-400" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}