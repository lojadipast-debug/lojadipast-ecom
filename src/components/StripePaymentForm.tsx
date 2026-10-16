import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/data/catalog';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/store/router';
import { useCart } from '@/store/cart';

interface StripePaymentFormProps {
  orderId: string;
  total: number;
}

export function StripePaymentForm({ orderId, total }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { navigate } = useRouter();
  const { clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!stripe || !elements) return;

    setSubmitting(true);

    try {
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/#/checkout-success?order=${orderId}`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message ?? 'Ocorreu um erro ao processar o pagamento.');
        setSubmitting(false);
        return;
      }

      // Payment succeeded — update order status as a fallback (webhook is primary)
      await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', orderId);

      clearCart();
      navigate(`/checkout-success?order=${orderId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Algo correu mal ao processar o pagamento.';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="rounded-2xl ring-1 ring-ink-100 p-4 bg-white">
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                address: { country: 'PT' },
              },
            },
          }}
        />
      </div>

      {error && (
        <p className="flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle size={15} /> {error}
        </p>
      )}

      <button type="submit" disabled={submitting || !stripe} className="btn-primary w-full disabled:opacity-60">
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> A processar pagamento…
          </span>
        ) : (
          <>Pagar {formatPrice(total)}</>
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
        <Lock size={13} className="text-sky-600" /> Pagamento encriptado · Stripe
      </p>
    </form>
  );
}
