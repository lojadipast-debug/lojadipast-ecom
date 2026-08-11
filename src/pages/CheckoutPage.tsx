import { useState } from 'react';
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
} from 'lucide-react';
import { useCart } from '@/store/cart';
import { useRouter } from '@/store/router';
import { formatPrice, effectivePrice } from '@/data/catalog';

type Step = 'info' | 'pago';
type PaymentMethod = 'card' | 'mbway' | 'paypal';

interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
  nif: string;
}

const EMPTY_INFO: ShippingInfo = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postal: '',
  nif: '',
};

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { navigate } = useRouter();
  const [step, setStep] = useState<Step>('info');
  const [info, setInfo] = useState<ShippingInfo>(EMPTY_INFO);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [billingSame, setBillingSame] = useState(true);
  const [mbwayPhone, setMbwayPhone] = useState('');

  const standardShipping = subtotal >= 50 ? 0 : 4.9;
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

  const infoValid =
    info.name.trim() && info.email.trim() && info.phone.trim() &&
    info.address.trim() && info.city.trim() && info.postal.trim();

  const goPayment = () => {
    if (!infoValid) {
      setError('Preenche todos os campos de contacto e envio.');
      return;
    }
    setError('');
    setStep('pago');
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const validateCard = (): string | null => {
    if (cardNumber.replace(/\s/g, '').length < 13) return 'Introduz um número de cartão válido.';
    if (cardExpiry.length < 5) return 'Introduz a data de expiração (MM/AA).';
    if (cardCvc.length < 3) return 'Introduz o código CVC/CVV.';
    if (!cardName.trim()) return 'Introduz o nome no cartão.';
    return null;
  };

  const validateMbway = (): string | null => {
    const digits = mbwayPhone.replace(/\D/g, '');
    if (digits.length < 9) return 'Introduz um número de telemóvel válido (9 dígitos).';
    return null;
  };

  const redirectToCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (paymentMethod === 'card') {
      const cardErr = validateCard();
      if (cardErr) { setError(cardErr); return; }
    } else if (paymentMethod === 'mbway') {
      const mbErr = validateMbway();
      if (mbErr) { setError(mbErr); return; }
    }

    setSubmitting(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
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
            address: info.address.trim(),
            city: info.city.trim(),
            postal: info.postal.trim(),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Não foi possível iniciar o pagamento.');
      }

      clearCart();
      window.location.href = data.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Algo correu mal ao processar o pagamento.';
      setError(msg);
      setSubmitting(false);
    }
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

      <form onSubmit={redirectToCheckout} className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* form */}
        <div className="flex flex-col gap-6">
          {step === 'info' && (
            <section className="rounded-3xl bg-white p-6 ring-1 ring-ink-100">
              <h2 className="font-display text-lg font-semibold text-ink-900">Contacto e envio</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Nome" placeholder="Maria Silva" required value={info.name} onChange={setField('name')} />
                <Field label="Email" type="email" placeholder="maria@email.com" required value={info.email} onChange={setField('email')} />
                <Field label="Telefone" placeholder="+351 912 345 678" required value={info.phone} onChange={setField('phone')} />
                <Field label="Morada" placeholder="Rua das Flores, 12" required value={info.address} onChange={setField('address')} className="sm:col-span-2" />
                <Field label="Cidade" placeholder="Lisboa" required value={info.city} onChange={setField('city')} />
                <Field label="Código postal" placeholder="1200-190" required value={info.postal} onChange={setField('postal')} />
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
                {/* Cartão de Crédito */}
                <PaymentOption
                  active={paymentMethod === 'card'}
                  onClick={() => setPaymentMethod('card')}
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
                  <div className="grid gap-4">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Número do cartão</span>
                      <input
                        className="input-field mt-1.5"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        inputMode="numeric"
                        autoComplete="cc-number"
                      />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Data de expiração (MM/AA)</span>
                        <input
                          className="input-field mt-1.5"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/AA"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">CVC / CVV</span>
                        <input
                          className="input-field mt-1.5"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Nome no cartão</span>
                      <input
                        className="input-field mt-1.5"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="MARIA SILVA"
                        autoComplete="cc-name"
                      />
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-cream-50 p-3.5 ring-1 ring-ink-100">
                      <input
                        type="checkbox"
                        checked={billingSame}
                        onChange={(e) => setBillingSame(e.target.checked)}
                        className="h-5 w-5 rounded accent-lilac-500"
                      />
                      <span className="text-sm text-ink-700">Utilizar endereço de envio como endereço de faturação</span>
                    </label>
                  </div>
                </PaymentOption>

                {/* MB WAY / Multibanco */}
                <PaymentOption
                  active={paymentMethod === 'mbway'}
                  onClick={() => setPaymentMethod('mbway')}
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
                  onClick={() => setPaymentMethod('paypal')}
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
    <span className={`rounded-md ${bg} px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white`}>
      {label}
    </span>
  );
}
