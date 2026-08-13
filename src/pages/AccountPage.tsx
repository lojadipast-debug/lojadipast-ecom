import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  Plus,
  Trash2,
  X,
  AlertCircle,
  Home,
  Building2,
  Mail,
  Lock,
} from 'lucide-react';
import { useAccount } from '@/store/account';
import type { AccountAddress } from '@/store/account';
import { useRouter } from '@/store/router';
import { useCart } from '@/store/cart';
import { useProducts } from '@/store/products';
import { formatPrice } from '@/data/catalog';
import { ProductCard } from '@/components/ProductCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Modal } from '@/components/Modal';
import { supabase } from '@/lib/supabase';

const SECTIONS = [
  { key: 'perfil', label: 'Perfil', Icon: UserIcon },
  { key: 'encomendas', label: 'Encomendas', Icon: Package },
  { key: 'favoritos', label: 'Favoritos', Icon: Heart },
  { key: 'moradas', label: 'Moradas', Icon: MapPin },
  { key: 'definicoes', label: 'Definições', Icon: Settings },
] as const;

export function AccountPage({ section }: { section: string }) {
  useScrollReveal();
  const { user, loading, orders, ordersLoading, logout } = useAccount();
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
          {active.key === 'perfil' && <ProfileSection />}

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

          {active.key === 'moradas' && <AddressesSection />}

          {active.key === 'definicoes' && (
            <Section title="Definições" desc="Preferências de notificação e conta.">
              <div className="flex flex-col gap-6">
                <ChangePasswordSection />
                <div className="flex flex-col gap-4">
                  <ToggleRow label="Newsletter" desc="Receber novidades e promoções" defaultChecked />
                  <ToggleRow label="Notificações de encomendas" desc="Avisos por email sobre envios" defaultChecked />
                  <ToggleRow label="Ofertas personalizadas" desc="Recomendações com base no histórico" />
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileSection() {
  const { user, saveProfile } = useAccount();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? '');
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setBirthDate(user.birthDate);
    }
  }, [user]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'O nome completo é obrigatório.';
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      errs.phone = 'O telefone é obrigatório.';
    } else if (phoneDigits.length < 9) {
      errs.phone = 'Introduz um telefone válido (mínimo 9 dígitos).';
    }

    const parts = birthDate.split('-');
    const y = parts[0] ?? '';
    const m = parts[1] ?? '';
    const d = parts[2] ?? '';
    if (!y || !m || !d) {
      errs.birthDate = 'A data de nascimento é obrigatória (Dia/Mês/Ano).';
    } else {
      const yearNum = parseInt(y, 10);
      const monthNum = parseInt(m, 10);
      const dayNum = parseInt(d, 10);
      const date = new Date(yearNum, monthNum - 1, dayNum);
      if (
        date.getFullYear() !== yearNum ||
        date.getMonth() !== monthNum - 1 ||
        date.getDate() !== dayNum
      ) {
        errs.birthDate = 'A data de nascimento é inválida.';
      } else if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
        errs.birthDate = 'Introduz um ano de nascimento válido.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) {
      setSaving(false);
      return;
    }

    setSaving(true);
    setState('idle');
    setMessage('');

    const res = await saveProfile({ name: name.trim(), phone: phone.trim(), birthDate });
    if (res.ok) {
      setState('success');
      setMessage('Alterações guardadas com sucesso!');
    } else {
      setState('error');
      setMessage(res.error ?? 'Não foi possível guardar.');
    }
    setSaving(false);
  };

  return (
    <Section title="Perfil" desc="Atualiza os teus dados pessoais.">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Field label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} placeholder="O teu nome" required />
            {errors.name && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.name}</p>}
          </div>
          <Field label="Email" value={user?.email ?? ''} disabled />
          <div>
            <Field label="Telefone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+351 912 345 678" required />
            {errors.phone && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.phone}</p>}
          </div>
          <div>
            <BirthDateField value={birthDate} onChange={setBirthDate} required />
            {errors.birthDate && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.birthDate}</p>}
          </div>
        </div>

        {state !== 'idle' && message && (
          <div
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
              state === 'success' ? 'bg-sky-50 text-sky-700' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {state === 'success' && <Check size={16} />}
            {state === 'error' && <AlertCircle size={16} />}
            {message}
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-fit disabled:opacity-60">
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> A guardar…
            </>
          ) : (
            <>Guardar alterações <ChevronRight size={16} /></>
          )}
        </button>
      </form>
    </Section>
  );
}

function AddressesSection() {
  const { addresses, saveAddress, deleteAddress } = useAccount();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AccountAddress | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const openEdit = (addr: AccountAddress) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteAddress(id);
    setConfirmDelete(null);
  };

  return (
    <Section title="Moradas" desc="Gere as tuas moradas de entrega.">
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <div key={addr.id} className="rounded-3xl bg-white p-5 ring-1 ring-ink-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="chip bg-lilac-100 ring-lilac-200 text-lilac-700">{addr.label}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-600">
                  {addr.buildingType === 'apartamento' ? <Building2 size={11} /> : <Home size={11} />}
                  {addr.buildingType === 'apartamento' ? 'Apartamento' : 'Casa'}
                </span>
              </div>
              <button
                onClick={() => openEdit(addr)}
                className="text-xs font-semibold text-lilac-600 hover:underline"
              >
                Editar
              </button>
            </div>
            <p className="mt-3 font-semibold text-ink-900">{addr.name}</p>
            <p className="text-sm text-ink-600">{addr.street}, {addr.houseNumber}</p>
            {addr.buildingType === 'apartamento' && (addr.floor || addr.apartmentUnit) && (
              <p className="text-sm text-ink-600">
                {addr.floor && `Andar ${addr.floor}`}
                {addr.floor && addr.apartmentUnit && ' · '}
                {addr.apartmentUnit}
              </p>
            )}
            <p className="text-sm text-ink-600">{addr.postal} {addr.city}</p>
            <p className="text-sm text-ink-600">{addr.country}</p>
            <p className="mt-2 text-sm text-ink-500">{addr.phone}</p>
            <button
              onClick={() => setConfirmDelete(addr.id)}
              className="mt-4 text-xs font-bold text-rose-500 hover:underline"
            >
              Eliminar morada
            </button>
          </div>
        ))}

        <button
          onClick={openAdd}
          className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-ink-200 text-ink-500 transition-colors hover:border-lilac-300 hover:text-lilac-600"
        >
          <Plus size={22} />
          <span className="text-sm font-semibold">Adicionar morada</span>
        </button>
      </div>

      {modalOpen && (
        <AddressModal
          editing={editingAddress}
          onClose={() => setModalOpen(false)}
          onSave={async (data) => {
            const res = await saveAddress(data);
            if (res.ok) setModalOpen(false);
            return res;
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-soft-lg">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-100">
              <Trash2 size={24} className="text-rose-600" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">Eliminar morada?</h3>
            <p className="mt-2 text-sm text-ink-600">Esta ação não pode ser desfeita.</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
              >
                Eliminar
              </button>
              <button onClick={() => setConfirmDelete(null)} className="btn-soft flex-1">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

function AddressModal({
  editing,
  onClose,
  onSave,
}: {
  editing: AccountAddress | null;
  onClose: () => void;
  onSave: (data: Omit<AccountAddress, 'id'> & { id?: string }) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [buildingType, setBuildingType] = useState<'casa' | 'apartamento'>(editing?.buildingType ?? 'casa');
  const [label, setLabel] = useState(editing?.label ?? 'Casa');
  const [name, setName] = useState(editing?.name ?? '');
  const [street, setStreet] = useState(editing?.street ?? '');
  const [houseNumber, setHouseNumber] = useState(editing?.houseNumber ?? '');
  const [floor, setFloor] = useState(editing?.floor ?? '');
  const [apartmentUnit, setApartmentUnit] = useState(editing?.apartmentUnit ?? '');
  const [postal, setPostal] = useState(editing?.postal ?? '');
  const [city, setCity] = useState(editing?.city ?? '');
  const [country, setCountry] = useState(editing?.country ?? 'Portugal');
  const [phone, setPhone] = useState(editing?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!name.trim() || !street.trim() || !city.trim() || !postal.trim() || !houseNumber.trim()) {
      setError('Preenche todos os campos obrigatórios.');
      setSaving(false);
      return;
    }

    if (buildingType === 'apartamento' && (!floor.trim() || !apartmentUnit.trim())) {
      setError('Indica o andar e a fração do apartamento.');
      setSaving(false);
      return;
    }

    const res = await onSave({
      id: editing?.id,
      label: label.trim() || (buildingType === 'casa' ? 'Casa' : 'Apartamento'),
      name: name.trim(),
      street: street.trim(),
      houseNumber: houseNumber.trim(),
      buildingType,
      ...(buildingType === 'apartamento' ? { floor: floor.trim(), apartmentUnit: apartmentUnit.trim() } : {}),
      postal: postal.trim(),
      city: city.trim(),
      country: country.trim() || 'Portugal',
      phone: phone.trim(),
    });

    if (!res.ok) {
      setError(res.error ?? 'Não foi possível guardar a morada.');
    }
    setSaving(false);
  };

  return (
    <Modal open onClose={onClose} label={editing ? 'Editar morada' : 'Adicionar morada'}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink-900">
          {editing ? 'Editar morada' : 'Adicionar morada'}
        </h2>
        <button
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-full text-ink-400 hover:bg-cream-100 hover:text-ink-700"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          {/* Building type selector */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Tipo de habitação</span>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBuildingType('casa')}
                className={`flex items-center justify-center gap-2.5 rounded-2xl border-2 px-4 py-4 text-base font-semibold transition-all ${
                  buildingType === 'casa' ? 'border-lilac-500 bg-lilac-50 text-lilac-700' : 'border-ink-200 text-ink-600 hover:border-lilac-300'
                }`}
              >
                <Home size={22} /> Casa
              </button>
              <button
                type="button"
                onClick={() => setBuildingType('apartamento')}
                className={`flex items-center justify-center gap-2.5 rounded-2xl border-2 px-4 py-4 text-base font-semibold transition-all ${
                  buildingType === 'apartamento' ? 'border-lilac-500 bg-lilac-50 text-lilac-700' : 'border-ink-200 text-ink-600 hover:border-lilac-300'
                }`}
              >
                <Building2 size={22} /> Apartamento
              </button>
            </div>
          </div>

          <Field label="Etiqueta" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Casa, Trabalho…" />
          <Field label="Nome do destinatário" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" required />
          <Field label="Morada" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Travessa Infante D. Henrique" required />
          <Field label="N.º da porta" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} placeholder="123" required />

          {buildingType === 'apartamento' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Andar" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="3.º" required />
              <Field label="Apartamento / Fração / Porta" value={apartmentUnit} onChange={(e) => setApartmentUnit(e.target.value)} placeholder="Esq, Bloco B, Ap 32" required />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Código Postal" value={postal} onChange={(e) => setPostal(e.target.value)} placeholder="4795-249" required />
            <Field label="Localidade" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Porto" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="País" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Portugal" />
            <Field label="Telefone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+351 912 345 678" />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
              <AlertCircle size={16} /> {error}
            </div>
          )}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> A guardar…
              </>
            ) : editing ? (
              'Guardar alterações'
            ) : (
              'Adicionar morada'
            )}
          </button>
          <button type="button" onClick={onClose} className="btn-soft">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}

function FavoritesSection() {
  const { favorites } = useCart();
  const { getProductById } = useProducts();
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

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function BirthDateField({ value, onChange, required }: { value: string; onChange: (v: string) => void; required?: boolean }) {
  const day = useMemo(() => (value ? value.split('-')[2] ?? '' : ''), [value]);
  const month = useMemo(() => (value ? value.split('-')[1] ?? '' : ''), [value]);
  const year = useMemo(() => (value ? value.split('-')[0] ?? '' : ''), [value]);

  const daysInMonth = useMemo(() => {
    const m = month ? parseInt(month, 10) : 0;
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    if (!m) return 31;
    return new Date(y, m, 0).getDate();
  }, [month, year]);

  const setPart = (part: 'year' | 'month' | 'day', val: string) => {
    const y = part === 'year' ? val : year;
    const m = part === 'month' ? val : month;
    const d = part === 'day' ? val : day;
    if (y && m && d) {
      onChange(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
    } else if (y || m || d) {
      onChange(`${y || ''}-${m || ''}-${d || ''}`);
    } else {
      onChange('');
    }
  };

  const selectClass =
    'input-field cursor-pointer appearance-none bg-[right_0.75rem_center] bg-no-repeat pr-9';
  const chevronStyle = { backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")" };

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
        Data de nascimento{required ? ' *' : ''}
      </span>
      <div className="mt-1.5 grid grid-cols-3 gap-2">
        <select
          className={selectClass}
          style={chevronStyle}
          value={day}
          onChange={(e) => setPart('day', e.target.value)}
        >
          <option value="">Dia</option>
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
            <option key={d} value={String(d).padStart(2, '0')}>{d}</option>
          ))}
        </select>
        <select
          className={selectClass}
          style={chevronStyle}
          value={month}
          onChange={(e) => setPart('month', e.target.value)}
        >
          <option value="">Mês</option>
          {MONTHS_PT.map((m, i) => (
            <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
          ))}
        </select>
        <select
          className={selectClass}
          style={chevronStyle}
          value={year}
          onChange={(e) => setPart('year', e.target.value)}
        >
          <option value="">Ano</option>
          {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ChangePasswordSection() {
  const { user } = useAccount();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sendingRecovery, setSendingRecovery] = useState(false);
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (next.length < 6) {
      errs.next = 'A nova palavra-passe deve ter pelo menos 6 caracteres.';
    }
    if (next !== confirm) {
      errs.confirm = 'As palavras-passe não coincidem.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setState('idle');
    setMessage('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: next });
      if (updateError) {
        setState('error');
        setMessage(updateError.message || 'Não foi possível atualizar a palavra-passe.');
        return;
      }
      setState('success');
      setMessage('Palavra-passe alterada com sucesso!');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch {
      setState('error');
      setMessage('Algo correu mal. Tenta novamente.');
    } finally {
      setSaving(false);
    }
  };

  const sendRecoveryEmail = async () => {
    if (!user?.email) return;
    setSendingRecovery(true);
    setRecoveryError('');
    try {
      const redirectTo = `${window.location.origin}/#/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo });
      if (resetError) {
        setRecoveryError(resetError.message || 'Não foi possível enviar o e-mail.');
        return;
      }
      setRecoveryModalOpen(true);
    } catch {
      setRecoveryError('Algo correu mal. Tenta novamente.');
    } finally {
      setSendingRecovery(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-5 ring-1 ring-ink-100">
      <div className="flex items-center gap-2">
        <Lock size={18} className="text-lilac-600" />
        <h3 className="font-display text-base font-semibold text-ink-900">Alterar palavra-passe</h3>
      </div>
      <p className="mt-1 text-sm text-ink-500">Define uma nova palavra-passe para a tua conta.</p>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <div>
          <Field label="Palavra-passe atual (opcional)" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••" />
        </div>
        <div>
          <Field label="Nova palavra-passe" type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="••••••••" required />
          {errors.next && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.next}</p>}
        </div>
        <div>
          <Field label="Confirmar nova palavra-passe" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required />
          {errors.confirm && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.confirm}</p>}
        </div>

        {state !== 'idle' && message && (
          <div
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
              state === 'success' ? 'bg-sky-50 text-sky-700' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {state === 'success' && <Check size={16} />}
            {state === 'error' && <AlertCircle size={16} />}
            {message}
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-fit disabled:opacity-60">
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> A guardar…
            </>
          ) : (
            <>Guardar nova palavra-passe <ChevronRight size={16} /></>
          )}
        </button>
      </form>

      <div className="mt-5 border-t border-ink-100 pt-5">
        <p className="text-sm text-ink-600">
          Preferes receber um link de recuperação por e-mail? Enviámos imediatamente para o teu e-mail associado.
        </p>
        <button
          type="button"
          onClick={sendRecoveryEmail}
          disabled={sendingRecovery || !user?.email}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-cream-100 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-cream-200 disabled:opacity-60"
        >
          {sendingRecovery ? (
            <><Loader2 size={16} className="animate-spin" /> A enviar…</>
          ) : (
            <><Mail size={16} /> Enviar link de recuperação para o meu e-mail</>
          )}
        </button>
        {recoveryError && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
            <AlertCircle size={16} />
            {recoveryError}
          </div>
        )}
      </div>
      {recoveryModalOpen && (
        <RecoverySentModal email={user?.email ?? ''} onClose={() => setRecoveryModalOpen(false)} />
      )}
    </div>
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
  const [showRecover, setShowRecover] = useState(false);

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
              <button
                type="button"
                onClick={() => setShowRecover(true)}
                className="text-center text-xs text-ink-500 hover:text-lilac-700"
              >
                Esqueceste-te da palavra-passe?
              </button>
            )}

            <p className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
              <Check size={13} className="text-sky-600" /> Dados protegidos · SSL
            </p>
          </form>
        </div>
      </div>
      {showRecover && <RecoveryModal onClose={() => setShowRecover(false)} />}
    </div>
  );
}

function RecoverySentModal({ email, onClose }: { email: string; onClose: () => void }) {
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="E-mail de recuperação enviado"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-ink-100 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-cream-100 hover:text-ink-700"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col items-center gap-4 px-7 pb-8 pt-10 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-100">
            <Mail size={26} className="text-sky-600" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink-900">E-mail enviado!</h2>
            <p className="mt-2 text-sm text-ink-600">
              Foi enviado um e-mail de recuperação para{' '}
              <span className="font-semibold text-ink-800">{email}</span>. Por favor, verifica a tua caixa de entrada.
            </p>
          </div>
          <button onClick={onClose} className="btn-primary w-full">Entendido</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function RecoveryModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Introduz o teu e-mail.');
      return;
    }
    setSubmitting(true);
    try {
      const redirectTo = `${window.location.origin}/#/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (resetError) {
        setError(resetError.message || 'Não foi possível enviar o e-mail.');
        return;
      }
      setSent(true);
    } catch {
      setError('Algo correu mal. Tenta novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recuperar palavra-passe"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-ink-100 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-cream-100 hover:text-ink-700"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col items-center gap-4 px-7 pb-8 pt-10 text-center">
          {sent ? (
            <>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-100">
                <Mail size={26} className="text-sky-600" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-ink-900">E-mail enviado!</h2>
                <p className="mt-2 text-sm text-ink-600">
                  Verifica a tua caixa de entrada. Enviámos um link para redefinires a tua palavra-passe.
                </p>
              </div>
              <button onClick={onClose} className="btn-primary w-full">Fechar</button>
            </>
          ) : (
            <>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-lilac-100">
                <Mail size={26} className="text-lilac-700" />
              </div>
              <div className="w-full text-left">
                <h2 className="font-display text-xl font-semibold text-ink-900">Recuperar palavra-passe</h2>
                <p className="mt-1 text-sm text-ink-600">
                  Introduz o teu e-mail e enviar-te-emos um link para redefinires a palavra-passe.
                </p>
              </div>
              <form onSubmit={submit} className="flex w-full flex-col gap-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">E-mail</span>
                  <input
                    type="email"
                    className="input-field mt-1.5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                    autoFocus
                  />
                </label>
                {error && <p className="text-sm text-rose-600">{error}</p>}
                <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> A enviar…
                    </span>
                  ) : (
                    <>Enviar link de recuperação <ChevronRight size={16} /></>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
