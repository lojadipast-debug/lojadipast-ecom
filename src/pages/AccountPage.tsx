import { useState } from 'react';
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  LogOut,
  Settings,
  ChevronRight,
  Check,
  Loader2,
} from 'lucide-react';
import { useAccount } from '@/store/account';
import { useRouter } from '@/store/router';
import { useCart } from '@/store/cart';
import { formatPrice, getProductById } from '@/data/catalog';
import { ProductCard } from '@/components/ProductCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const SECTIONS = [
  { key: 'perfil', label: 'Perfil', Icon: UserIcon },
  { key: 'encomendas', label: 'Encomendas', Icon: Package },
  { key: 'favoritos', label: 'Favoritos', Icon: Heart },
  { key: 'moradas', label: 'Moradas', Icon: MapPin },
  { key: 'definicoes', label: 'Definições', Icon: Settings },
] as const;

export function AccountPage({ section }: { section: string }) {
  useScrollReveal();
  const { user, loading, orders, ordersLoading, addresses, logout } = useAccount();
  const { navigate } = useRouter();

  if (loading) {
    return (
      <div className="container-x flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-ink-300" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const active = SECTIONS.find((s) => s.key === section) ?? SECTIONS[0];

  return (
    <div className="container-x py-10">
      <div className="reveal flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-lilac-200 to-rose-200 font-display text-xl font-semibold text-ink-800">
          {user.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm text-ink-500">Bem-vinda de volta,</p>
          <h1 className="font-display text-2xl font-semibold text-ink-900">{user.name}</h1>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* sidebar */}
        <aside className="reveal">
          <nav className="flex gap-2 overflow-x-auto rounded-3xl bg-white p-2 ring-1 ring-ink-100 lg:flex-col">
            {SECTIONS.map((s) => {
              const isActive = s.key === active.key;
              return (
                <button
                  key={s.key}
                  onClick={() => navigate(`/conta/${s.key}`)}
                  className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive ? 'bg-lilac-100 text-lilac-700' : 'text-ink-600 hover:bg-cream-100'
                  }`}
                >
                  <s.Icon size={18} />
                  {s.label}
                </button>
              );
            })}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100"
            >
              <LogOut size={18} /> Sair
            </button>
          </nav>
        </aside>

        {/* content */}
        <div>
          {active.key === 'perfil' && (
            <Section title="Perfil" desc="Atualiza os teus dados pessoais.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome" defaultValue={user.name} />
                <Field label="Email" defaultValue={user.email} />
                <Field label="Telefone" defaultValue="+351 912 345 678" />
                <Field label="Data de nascimento" defaultValue="1990-05-12" type="date" />
              </div>
              <button className="btn-primary mt-5 w-fit">Guardar alterações</button>
            </Section>
          )}

          {active.key === 'encomendas' && (
            <Section title="Encomendas" desc="Acompanha as tuas compras.">
              {ordersLoading ? (
                <div className="flex items-center justify-center rounded-3xl bg-white py-16 ring-1 ring-ink-100">
                  <Loader2 size={24} className="animate-spin text-ink-300" />
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white py-16 text-center ring-1 ring-ink-100">
                  <Package size={28} className="text-ink-300" />
                  <p className="font-display text-lg font-semibold text-ink-900">Ainda sem encomendas</p>
                  <p className="text-sm text-ink-500">As tuas compras vão aparecer aqui.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {orders.map((order) => (
                    <li key={order.id} className="rounded-3xl bg-white p-5 ring-1 ring-ink-100">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-base font-semibold text-ink-900">{order.id}</p>
                          <p className="text-xs text-ink-500">{order.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              order.status === 'Entregue'
                                ? 'bg-sky-100 text-sky-700'
                                : order.status === 'Em envio'
                                ? 'bg-lilac-100 text-lilac-700'
                                : 'bg-cream-200 text-cream-800'
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="font-semibold text-ink-900">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                            )}
                            <div>
                              <p className="text-xs font-semibold text-ink-800">{item.name}</p>
                              <p className="text-xs text-ink-400">Qtd {item.qty}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          {active.key === 'favoritos' && <FavoritesSection />}

          {active.key === 'moradas' && (
            <Section title="Moradas" desc="Gere as tuas moradas de entrega.">
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <div key={addr.id} className="rounded-3xl bg-white p-5 ring-1 ring-ink-100">
                    <div className="flex items-center justify-between">
                      <span className="chip bg-lilac-100 ring-lilac-200 text-lilac-700">{addr.label}</span>
                      <button className="text-xs font-semibold text-lilac-600 hover:underline">Editar</button>
                    </div>
                    <p className="mt-3 font-semibold text-ink-900">{addr.name}</p>
                    <p className="text-sm text-ink-600">{addr.street}</p>
                    <p className="text-sm text-ink-600">{addr.postal} {addr.city}</p>
                    <p className="mt-2 text-sm text-ink-500">{addr.phone}</p>
                  </div>
                ))}
                <button className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-ink-200 text-ink-500 transition-colors hover:border-lilac-300 hover:text-lilac-600">
                  <MapPin size={22} />
                  <span className="text-sm font-semibold">Adicionar morada</span>
                </button>
              </div>
            </Section>
          )}

          {active.key === 'definicoes' && (
            <Section title="Definições" desc="Preferências de notificação e conta.">
              <div className="flex flex-col gap-4">
                <ToggleRow label="Newsletter" desc="Receber novidades e promoções" defaultChecked />
                <ToggleRow label="Notificações de encomendas" desc="Avisos por email sobre envios" defaultChecked />
                <ToggleRow label="Ofertas personalizadas" desc="Recomendações com base no histórico" />
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function FavoritesSection() {
  const { favorites, toggleFavorite } = useCart();
  const products = favorites.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (products.length === 0) {
    return (
      <Section title="Favoritos" desc="As peças que guardaste para mais tarde.">
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white py-16 text-center ring-1 ring-ink-100">
          <Heart size={28} className="text-ink-300" />
          <p className="font-display text-lg font-semibold text-ink-900">Ainda sem favoritos</p>
          <p className="text-sm text-ink-500">Guarda as tuas peças preferidas carregando no coração.</p>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Favoritos" desc={`${products.length} peças guardadas.`}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </Section>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="reveal">
      <h2 className="font-display text-2xl font-semibold text-ink-900">{title}</h2>
      <p className="mt-1 text-sm text-ink-500">{desc}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, className = '', ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</span>
      <input className="input-field mt-1.5" {...props} />
    </label>
  );
}

function ToggleRow({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-ink-100">
      <div>
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        <p className="text-xs text-ink-500">{desc}</p>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-lilac-500' : 'bg-ink-200'}`}
        aria-pressed={on}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
        />
      </button>
    </div>
  );
}

function AuthScreen() {
  const { login, register } = useAccount();
  const { navigate } = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res =
        mode === 'login'
          ? await login(email, password)
          : await register(name, email, password);
      if (!res.ok) {
        setError(res.error ?? 'Algo correu mal.');
        return;
      }
      navigate('/conta/perfil');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-md">
        <div className="reveal overflow-hidden rounded-4xl bg-white shadow-soft ring-1 ring-ink-100">
          <div className="flex">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                mode === 'login' ? 'bg-lilac-100 text-lilac-700' : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                mode === 'register' ? 'bg-lilac-100 text-lilac-700' : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4 p-6">
            <h1 className="font-display text-2xl font-semibold text-ink-900">
              {mode === 'login' ? 'Bem-vinda de volta' : 'Junta-te à Dipa'}
            </h1>
            <p className="-mt-2 text-sm text-ink-500">
              {mode === 'login'
                ? 'Entra para gerir encomendas e favoritos.'
                : 'Cria uma conta e recebe 10% na primeira compra.'}
            </p>

            {mode === 'register' && (
              <Field label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="O teu nome" />
            )}
            <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
            <Field label="Palavra-passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
              {submitting ? 'A processar…' : (mode === 'login' ? 'Entrar' : 'Criar conta')} <ChevronRight size={16} />
            </button>

            {mode === 'login' && (
              <button type="button" className="text-center text-xs text-ink-500 hover:text-lilac-700">
                Esqueceste-te da palavra-passe?
              </button>
            )}

            <p className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
              <Check size={13} className="text-sky-600" /> Dados protegidos · SSL
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
