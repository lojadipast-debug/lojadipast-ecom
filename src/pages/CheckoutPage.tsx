import { useState } from 'react';
import { Check, CreditCard, Lock, Truck, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useRouter } from '@/store/router';
import { formatPrice } from '@/data/catalog';
import { supabase } from '@/lib/supabase';

type Step = 'info' | 'pago' | 'confirm';

interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
}

const EMPTY_INFO: ShippingInfo = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postal: '',
};

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { navigate } = useRouter();
  const [step, setStep] = useState<Step>('info');
  const [info, setInfo] = useState<ShippingInfo>(EMPTY_INFO);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mbway' | 'paypal'>('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);

  const standardShipping = subtotal >= 50 ? 0 : 4.9;
  const shipping = shippingMethod === 'express' ? 9.9 : standardShipping;
  const total = subtotal + shipping;

  if (items.length === 0 && step !== 'confirm') {
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

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          customer_name: info.name.trim(),
          customer_email: info.email.trim(),
          phone: info.phone.trim(),
          address: info.address.trim(),
          city: info.city.trim(),
          postal_code: info.postal.trim(),
          shipping_method: shippingMethod,
          payment_method: paymentMethod,
          shipping_cost: shipping,
          total,
          status: 'Processamento',
        })
        .select('id')
        .single();

      if (orderErr || !order) {
        throw new Error(orderErr?.message ?? 'Não foi possível registar a encomenda.');
      }

      const lineItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: item.product.price,
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(lineItems);

      if (itemsErr) {
        throw new Error('A encomenda foi criada mas os artigos não foram guardados.');
      }

      setOrderId(order.id.slice(0, 8).toUpperCase());
      setOrderTotal(total);
      setStep('confirm');
      clearCart();
      window.scrollTo({ top: 0 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Algo correu mal ao finalizar a compra.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-x py-10">
      {/* steps */}
      <div className=" flex items-center justify-center gap-2 text-sm">
        {(['info', 'pago', 'confirm'] as const).map((s, i) => {
          const labels = ['Informação', 'Pagamento', 'Confirmação'];
          const active = step === s;
          const done =
            (step === 'pago' && s === 'info') ||
            (step === 'confirm' && (s === 'info' || s === 'pago'));
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
              {i < 2 && <span className="h-px w-6 bg-ink-200 sm:w-10" />}
            </div>
          );
        })}
      </div>

      {step === 'confirm' ? (
        <div className="mx-auto mt-12 max-w-lg text-center">
          <div className=" mx-auto grid h-20 w-20 place-items-center rounded-full bg-sky-100">
            <Check size={36} className="text-sky-600" />
          </div>
          <h1 className=" mt-6 font-display text-3xl font-semibold text-ink-900">
            Obrigado pela tua encomenda!
          </h1>
          <p className=" mt-3 text-ink-600">
            Recebemos a tua encomenda <span className="font-semibold text-ink-900">#{orderId}</span> e
            vamos prepará-la com todo o carinho. Enviámos a confirmação para o teu email.
          </p>
          <div className=" mt-6 rounded-2xl bg-cream-100 p-4 text-left text-sm">
            <p className="flex items-center gap-2 text-ink-700">
              <Truck size={16} className="text-lilac-600" /> Entrega estimada em 24-48h
            </p>
            <p className="mt-2 flex items-center justify-between text-ink-700">
              <span>Total pago</span>
              <span className="font-semibold">{formatPrice(orderTotal)}</span>
            </p>
          </div>
          <button onClick={() => navigate('/')} className="btn-primary mt-8">
            Voltar à loja
          </button>
        </div>
      ) : (
        <form onSubmit={placeOrder} className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* form */}
          <div className="flex flex-col gap-6">
            {step === 'info' && (
              <section className=" rounded-3xl bg-white p-6 ring-1 ring-ink-100">
                <h2 className="font-display text-lg font-semibold text-ink-900">Contacto e envio</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Nome" placeholder="Maria Silva" required value={info.name} onChange={setField('name')} />
                  <Field label="Email" type="email" placeholder="maria@email.com" required value={info.email} onChange={setField('email')} />
                  <Field label="Telefone" placeholder="+351 912 345 678" required value={info.phone} onChange={setField('phone')} />
                  <Field label="Morada" placeholder="Rua das Flores, 12" required value={info.address} onChange={setField('address')} className="sm:col-span-2" />
                  <Field label="Cidade" placeholder="Lisboa" required value={info.city} onChange={setField('city')} />
                  <Field label="Código postal" placeholder="1200-190" required value={info.postal} onChange={setField('postal')} />
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
              <section className=" rounded-3xl bg-white p-6 ring-1 ring-ink-100">
                <h2 className="font-display text-lg font-semibold text-ink-900">Pagamento</h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                  <Lock size={13} /> Pagamento encriptado e seguro
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <PayCard
                    title="Cartão de crédito/débito"
                    desc="Visa, Mastercard, Amex"
                    icon={<CreditCard size={18} />}
                    active={paymentMethod === 'card'}
                    onClick={() => setPaymentMethod('card')}
                  />
                  <PayCard
                    title="MB WAY"
                    desc="Pagamento via telemóvel"
                    active={paymentMethod === 'mbway'}
                    onClick={() => setPaymentMethod('mbway')}
                  />
                  <PayCard
                    title="PayPal"
                    desc="Conta PayPal ou cartão"
                    active={paymentMethod === 'paypal'}
                    onClick={() => setPaymentMethod('paypal')}
                  />
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-5 grid gap-4">
                    <Field label="Nome no cartão" placeholder="MARIA SILVA" />
                    <Field label="Número do cartão" placeholder="1234 5678 9012 3456" />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Validade" placeholder="MM/AA" />
                      <Field label="CVV" placeholder="123" />
                    </div>
                  </div>
                )}
                {paymentMethod === 'mbway' && (
                  <div className="mt-5">
                    <Field label="Telemóvel MB WAY" placeholder="+351 912 345 678" />
                  </div>
                )}
                {paymentMethod === 'paypal' && (
                  <p className="mt-5 rounded-2xl bg-cream-50 p-4 text-sm text-ink-600 ring-1 ring-ink-100">
                    Serás redirecionada para o PayPal para concluir o pagamento de forma segura.
                  </p>
                )}

                {error && (
                  <p className="mt-4 flex items-center gap-2 text-sm text-rose-600">
                    <AlertCircle size={15} /> {error}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> A processar…
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
          <aside className=" lg:sticky lg:top-28 lg:self-start">
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
                      {formatPrice(item.product.price * item.quantity)}
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

function PayCard({
  title,
  desc,
  icon,
  active,
  onClick,
}: {
  title: string;
  desc: string;
  icon?: React.ReactNode;
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
      <div className="flex flex-1 items-center gap-2">
        {icon && <span className="text-ink-500">{icon}</span>}
        <div>
          <p className="text-sm font-semibold text-ink-900">{title}</p>
          <p className="text-xs text-ink-500">{desc}</p>
        </div>
      </div>
    </button>
  );
}
