import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {
  Check,
  Lock,
  ChevronLeft,
  ChevronDown,
  Loader2,
  AlertCircle,
  CreditCard,
  Smartphone,
  Wallet,
  Shield,
  Home,
  Building2,
  MapPin,
} from 'lucide-react';
import { useCart } from '@/store/cart';
import { useRouter } from '@/store/router';
import { useAccount } from '@/store/account';
import { formatPrice, effectivePrice } from '@/data/catalog';
import type { AccountAddress } from '@/store/account';
import { StripePaymentForm } from '@/components/StripePaymentForm';

type Step = 'info' | 'pago';
type PaymentMethod = 'card' | 'mbway' | 'paypal';

interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  houseNumber: string;
  buildingType: 'casa' | 'apartamento';
  floor: string;
  apartmentUnit: string;
  city: string;
  postal: string;
  country: string;
  nif: string;
}

const EMPTY_INFO: ShippingInfo = {
  name: '',
  email: '',
  phone: '',
  address: '',
  houseNumber: '',
  buildingType: 'casa',
  floor: '',
  apartmentUnit: '',
  city: '',
  postal: '',
  country: 'Portugal',
  nif: '',
};

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function addressToInfo(addr: AccountAddress, fallbackName: string, fallbackEmail: string): ShippingInfo {
  return {
    name: addr.name || fallbackName,
    email: fallbackEmail,
    phone: addr.phone,
    address: addr.street,
    houseNumber: addr.houseNumber,
    buildingType: addr.buildingType,
    floor: addr.floor ?? '',
    apartmentUnit: addr.apartmentUnit ?? '',
    city: addr.city,
    postal: addr.postal,
    country: addr.country,
    nif: '',
  };
}

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { navigate } = useRouter();
  const { user, addresses } = useAccount();
  const [step, setStep] = useState<Step>('info');
  const [info, setInfo] = useState<ShippingInfo>(EMPTY_INFO);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [mbwayPhone, setMbwayPhone] = useState('');

  // PaymentIntent state for Stripe Elements
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Auto-fill from first saved address when user is logged in
  useEffect(() => {
    if (user && addresses.length > 0) {
      setInfo(addressToInfo(addresses[0], user.name, user.email));
    } else if (user) {
      setInfo((prev) => ({ ...prev, name: user.name, email: user.email, phone: user.phone ?? '' }));
    }
  }, [user, addresses]);

  // TEMPORÁRIO PARA TESTES: Portes grátis no envio Standard (mudado de 4.9 para 0)
  const standardShipping = subtotal >= 50 ? 0 : 0;
  const shipping = shippingMethod === 'express' ? 9.9 : standardShipping;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container-x flex flex-col items-center justify-center gap-4 py-28 text-center">
        <p className="font-display text-2xl font-semibold text-ink-900">Sem itens para finalizar</p>
        <button onClick={() => navigate('/catalogo')} className="btn-primary">
          Ir às compras
        </button>
      </div>
    );
  }

  const setField = (key: keyof ShippingInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setInfo((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const selectAddress = (addr: AccountAddress) => {
    setInfo(addressToInfo(addr, user?.name ?? '', user?.email ?? ''));
    setShowAddressPicker(false);
  };

  const infoValid =
    info.name.trim() && info.email.trim() && info.phone.trim() &&
    info.address.trim() && info.houseNumber.trim() && info.city.trim() && info.postal.trim() &&
    (info.buildingType === 'casa' || (info.floor.trim() && info.apartmentUnit.trim()));

  const goPayment = () => {
    if (!infoValid) {
      setError('Preenche todos os campos de contacto e envio.');
      return;
    }
    setError('');
    setStep('pago');
  };

  const validateMbway = (): string | null => {
    const digits = mbwayPhone.replace(/\D/g, '');
    if (digits.length < 9) return 'Introduz um número de telemóvel válido (9 dígitos).';
    return null;
  };

  const buildRequestBody = () => ({
    items: items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      price: effectivePrice(item.product),
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      image: item.product.images[0] ?? '',
    })),
    shippingMethod,
    shippingCost: shipping,
    subtotal,
    paymentMethod,
    mbwayPhone: paymentMethod === 'mbway' ? mbwayPhone : undefined,
    nif: info.nif.trim() || undefined,
    customer: {
      name: info.name.trim(),
      email: info.email.trim(),
      phone: info.phone.trim(),
      address: `${info.address.trim()}, ${info.houseNumber.trim()}${info.buildingType === 'apartamento' ? `, Andar ${info.floor.trim()}, ${info.apartmentUnit.trim()}` : ''}`,
      city: info.city.trim(),
      postal: info.postal.trim(),
      country: info.country.trim(),
    },
  });

  const createPaymentIntent = async () => {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(buildRequestBody()),
    });
    const data = await res.json();
    if (!res.ok || !data.clientSecret) {
      throw new Error(data.error ?? 'Não foi possível iniciar o pagamento.');
    }
    setClientSecret(data.clientSecret);
    setOrderId(data.orderId);
    return data.orderId as string;
  };

  const redirectToHostedCheckout = async () => {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(buildRequestBody()),
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      throw new Error(data.error ?? 'Não foi possível iniciar o pagamento.');
    }
    clearCart();
    window.location.href = data.url;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (paymentMethod === 'mbway') {
      const mbErr = validateMbway();
      if (mbErr) { setError(mbErr); return; }
    }

    setSubmitting(true);

    try {
      if (paymentMethod === 'card') {
        // PaymentIntent flow — Stripe Elements handles card details on-site
        await createPaymentIntent();
        // The StripePaymentForm component will handle confirmation
      } else {
        // MB WAY / PayPal — redirect to Stripe hosted checkout
        await redirectToHostedCheckout();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Algo correu mal ao processar o pagamento.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#7c5cBf',
      colorBackground: '#ffffff',
      colorText: '#1c1917',
      colorDanger: '#e11d48',
      borderRadius: '12px',
      spacingUnit: '4px',
    },
  };

  return (
    <div className="container-x py-10">
      {/* steps */}
      <div className="flex items-center justify-center gap-2 text-sm">
        {(['info', 'pago'] as const).map((s, i) => {
          const labels = ['Informação', 'Pagamento'];
          const active = step === s;
          const done = step === 'pago' && s === 'info';
          return (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-all ${
                  active ? 'bg-lilac-500 text-white' : done ? 'bg-sky-300 text-sky-800' : 'bg-ink-100 text-ink-400'
                }`}
              >
                {done ? <Check size={15} /> : i + 1}
              </span>
              <span className={`hidden font-semibold sm:block ${active ? 'text-ink-900' : 'text-ink-400'}`}>
                {labels[i]}
              </span>
              {i < 1 && <span className="h-px w-6 bg-ink-200 sm:w-10" />}
            </div>
          );
        })}
      </div>

      <form onSubmit={handlePay} className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* form */}
        <div className="flex flex-col gap-6">
          {step === 'info' && (
            <section className="rounded-3xl bg-white p-6 ring-1 ring-ink-100">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink-900">Contacto e envio</h2>
                {user && addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddressPicker(true)}
                    className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 transition-all hover:bg-purple-100"
                  >
                    <MapPin size={16} /> Selecionar das minhas moradas guardadas
                  </button>
                )}
              </div>

              {/* Building type selector */}
              <div className="mt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Tipo de habitação</span>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInfo((p) => ({ ...p, buildingType: 'casa' }))}
                    className={`flex items-center justify-center gap-2.5 rounded-2xl border-2 px-4 py-4 text-base font-semibold transition-all ${
                      info.buildingType === 'casa' ? 'border-lilac-500 bg-lilac-50 text-lilac-700' : 'border-ink-200 text-ink-600 hover:border-lilac-300'
                    }`}
                  >
                    <Home size={22} /> Casa
                  </button>
                  <button
                    type="button"
                    onClick={() => setInfo((p) => ({ ...p, buildingType: 'apartamento' }))}
                    className={`flex items-center justify-center gap-2.5 rounded-2xl border-2 px-4 py-4 text-base font-semibold transition-all ${
                      info.buildingType === 'apartamento' ? 'border-lilac-500 bg-lilac-50 text-lilac-700' : 'border-ink-200 text-ink-600 hover:border-lilac-300'
                    }`}
                  >
                    <Building2 size={22} /> Apartamento
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Nome" placeholder="Maria Silva" required value={info.name} onChange={setField('name')} />
                <Field label="Email" type="email" placeholder="maria@email.com" required value={info.email} onChange={setField('email')} />
                <Field label="Telefone" placeholder="+351 912 345 678" required value={info.phone} onChange={setField('phone')} />
                <Field label="Morada" placeholder="Travessa Infante D. Henrique" required value={info.address} onChange={setField('address')} className="sm:col-span-2" />
                <Field label="N.º da porta" placeholder="123" required value={info.houseNumber} onChange={setField('houseNumber')} />
                {info.buildingType === 'apartamento' && (
                  <>
                    <Field label="Andar" placeholder="3.º" required value={info.floor} onChange={setField('floor')} />
                    <Field label="Apartamento / Fração / Porta" placeholder="Esq, Bloco B, Ap 32" required value={info.apartmentUnit} onChange={setField('apartmentUnit')} />
                  </>
                )}
                <Field label="Código postal" placeholder="4795-249" required value={info.postal} onChange={setField('postal')} />
                <Field label="Localidade" placeholder="Porto" required value={info.city} onChange={setField('city')} />
                <Field label="País" placeholder="Portugal" value={info.country} onChange={setField('country')} />
                <Field label="NIF (opcional)" placeholder="123456789" value={info.nif} onChange={setField('nif')} />
              </div>
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Método de envio
                </p>
                <div className="flex flex-col gap-2">
                  <ShipCard
                    title="Standard · 24-48h"
                    desc="Entrega ao domicílio"
                    price={standardShipping === 0 ? 'Grátis' : formatPrice(standardShipping)}
                    active={shippingMethod === 'standard'}
                    onClick={() => setShippingMethod('standard')}
                  />
                  <ShipCard
                    title="Express · 24h"
                    desc="Entrega prioritária"
                    price={formatPrice(9.9)}
                    active={shippingMethod === 'express'}
                    onClick={() => setShippingMethod('express')}
                  />
                </div>
              </div>
              {error && (
                <p className="mt-4 flex items-center gap-2 text-sm text-rose-600">
                  <AlertCircle size={15} /> {error}
                </p>
              )}
              <button
                type="button"
                onClick={goPayment}
                className="btn-primary mt-6 w-full"
              >
                Continuar para pagamento
              </button>
              <button
                type="button"
                onClick={() => navigate('/carrinho')}
                className="mt-3 flex items-center justify-center gap-1 text-sm text-ink-500 hover:text-ink-800"
              >
                <ChevronLeft size={15} /> Voltar ao carrinho
              </button>
            </section>
          )}

          {step === 'pago' && (
            <section className="rounded-3xl bg-white p-6 ring-1 ring-ink-100">
              <h2 className="font-display text-lg font-semibold text-ink-900">Pagamento</h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                <Lock size={13} /> Pagamento processado de forma segura
              </p>

              {/* Payment method accordion */}
              <div className="mt-5 flex flex-col gap-3">
                {/* Cartão de Crédito — Stripe Elements on-site */}
                <PaymentOption
                  active={paymentMethod === 'card'}
                  onClick={() => { setPaymentMethod('card'); setClientSecret(null); setOrderId(null); }}
                  icon={<CreditCard size={20} />}
                  title="Cartão de Crédito / Débito"
                  badges={
                    <div className="flex items-center gap-1.5">
                      <CardBadge label="VISA" bg="bg-[#1a1f71]" />
                      <CardBadge label="MC" bg="bg-[#eb001b]" />
                      <CardBadge label="AMEX" bg="bg-[#006fcf]" />
                    </div>
                  }
                >
                  {clientSecret && orderId ? (
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                      <StripePaymentForm orderId={orderId} total={total} />
                    </Elements>
                  ) : (
                    <p className="text-sm text-ink-500">
                      Clica em "Pagar" para carregar o formulário de pagamento seguro da Stripe.
                    </p>
                  )}
                </PaymentOption>

                {/* MB WAY / Multibanco */}
                <PaymentOption
                  active={paymentMethod === 'mbway'}
                  onClick={() => { setPaymentMethod('mbway'); setClientSecret(null); setOrderId(null); }}
                  icon={<Smartphone size={20} />}
                  title="MB WAY / Multibanco"
                  badges={
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-[#e20074] px-2 py-0.5 text-[10px] font-bold text-white">MB WAY</span>
                      <span className="rounded-md bg-[#0066b1] px-2 py-0.5 text-[10px] font-bold text-white">Multibanco</span>
                    </div>
                  }
                >
                  <div className="flex flex-col gap-4">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Número de telemóvel MB WAY</span>
                      <input
                        className="input-field mt-1.5"
                        value={mbwayPhone}
                        onChange={(e) => setMbwayPhone(e.target.value)}
                        placeholder="912 345 678"
                        inputMode="tel"
                      />
                    </label>
                    <div className="flex items-start gap-2.5 rounded-2xl bg-cream-50 p-4 text-xs leading-relaxed text-ink-600 ring-1 ring-ink-100">
                      <Smartphone size={16} className="mt-0.5 shrink-0 text-[#e20074]" />
                      <p>
                        Receberás uma notificação na app MB WAY para autorizares o pagamento.
                        Para Multibanco, geramos uma referência de pagamento que será enviada
                        por email após confirmares.
                      </p>
                    </div>
                  </div>
                </PaymentOption>

                {/* PayPal */}
                <PaymentOption
                  active={paymentMethod === 'paypal'}
                  onClick={() => { setPaymentMethod('paypal'); setClientSecret(null); setOrderId(null); }}
                  icon={<Wallet size={20} />}
                  title="PayPal"
                  badges={
                    <span className="rounded-md bg-[#003087] px-2 py-0.5 text-[10px] font-bold text-white">Pay<span className="text-[#009cde]">Pal</span></span>
                  }
                >
                  <div className="flex items-start gap-2.5 rounded-2xl bg-cream-50 p-4 text-sm leading-relaxed text-ink-600 ring-1 ring-ink-100">
                    <Shield size={16} className="mt-0.5 shrink-0 text-[#003087]" />
                    <p>
                      Serás redirecionada em segurança para o site do PayPal para concluíres
                      o pagamento com a tua conta PayPal. Após a autorização, voltarás
                      automaticamente para a loja.
                    </p>
                  </div>
                </PaymentOption>
              </div>

              {error && (
                <p className="mt-4 flex items-center gap-2 text-sm text-rose-600">
                  <AlertCircle size={15} /> {error}
                </p>
              )}

              {/* Show the "Pay" button only for non-card methods or when card form isn't loaded yet */}
              {!(paymentMethod === 'card' && clientSecret && orderId) && (
                <div className="mt-6 flex flex-col gap-3">
                  <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> A preparar pagamento…
                      </span>
                    ) : (
                      `Pagar ${formatPrice(total)}`
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('info')}
                    className="flex items-center justify-center gap-1 text-sm text-ink-500 hover:text-ink-800"
                  >
                    <ChevronLeft size={15} /> Voltar
                  </button>
                </div>
              )}

              {paymentMethod === 'card' && clientSecret && orderId && (
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="mt-4 flex items-center justify-center gap-1 text-sm text-ink-500 hover:text-ink-800"
                >
                  <ChevronLeft size={15} /> Voltar
                </button>
              )}
            </section>
          )}
        </div>

        {/* summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-white p-6 ring-1 ring-ink-100 shadow-soft">
            <h2 className="font-display text-lg font-semibold text-ink-900">A tua encomenda</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                    <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                    <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink-900 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-ink-900">{item.product.name}</p>
                    <p className="text-xs text-ink-500">{item.color} · {item.size}</p>
                  </div>
                  <span className="text-sm font-semibold text-ink-900">
                    {formatPrice(effectivePrice(item.product) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 flex flex-col gap-2 border-t border-ink-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-600">Subtotal</dt>
                <dd className="font-medium text-ink-900">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-600">Envio</dt>
                <dd className="font-medium text-ink-900">
                  {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
                </dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-ink-100 pt-3">
                <dt className="font-display text-base font-semibold text-ink-900">Total</dt>
                <dd className="font-display text-xl font-semibold text-ink-900">{formatPrice(total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </form>

      {/* Address picker modal */}
      {showAddressPicker && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="As tuas moradas"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setShowAddressPicker(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink-900">As tuas moradas</h2>
              <button
                onClick={() => setShowAddressPicker(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-ink-400 hover:bg-cream-100 hover:text-ink-700"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => selectAddress(addr)}
                  className="rounded-2xl bg-cream-50 p-4 text-left ring-1 ring-ink-100 transition-all hover:ring-lilac-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="chip bg-lilac-100 ring-lilac-200 text-lilac-700">{addr.label}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-600">
                      {addr.buildingType === 'apartamento' ? <Building2 size={11} /> : <Home size={11} />}
                      {addr.buildingType === 'apartamento' ? 'Apartamento' : 'Casa'}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-ink-900">{addr.name}</p>
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
                  <p className="mt-1 text-sm text-ink-500">{addr.phone}</p>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function Field({
  label,
  className = '',
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</span>
      <input className="input-field mt-1.5" {...props} />
    </label>
  );
}

function ShipCard({
  title,
  desc,
  price,
  active,
  onClick,
}: {
  title: string;
  desc: string;
  price: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-3 rounded-2xl p-3.5 text-left ring-1 transition-all ${
        active ? 'bg-lilac-50 ring-lilac-500' : 'bg-cream-50 ring-ink-100 hover:ring-lilac-300'
      }`}
    >
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-all ${
          active ? 'border-lilac-500 bg-lilac-500' : 'border-ink-300'
        }`}
      >
        {active && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        <p className="text-xs text-ink-500">{desc}</p>
      </div>
      <span className="text-sm font-semibold text-ink-700">{price}</span>
    </button>
  );
}

function PaymentOption({
  active,
  onClick,
  icon,
  title,
  badges,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  badges?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl ring-1 transition-all ${
        active ? 'bg-lilac-50/50 ring-lilac-500' : 'bg-white ring-ink-200 hover:ring-lilac-300'
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex w-full cursor-pointer items-center gap-3 p-4 text-left"
      >
        <span
          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-all ${
            active ? 'border-lilac-500 bg-lilac-500' : 'border-ink-300'
          }`}
        >
          {active && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${
            active ? 'bg-lilac-200 text-lilac-700' : 'bg-ink-100 text-ink-500'
          }`}
        >
          {icon}
        </span>
        <div className="flex flex-1 items-center justify-between gap-3">
          <span className="text-sm font-semibold text-ink-900">{title}</span>
          {badges}
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-ink-400 transition-transform duration-300 ${active ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-ink-100 p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function CardBadge({ label, bg }: { label: string; bg: string }) {
  return (
    <span className={'rounded-md ' + bg + ' px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white'}>
      {label}
    </span>
  );
}
