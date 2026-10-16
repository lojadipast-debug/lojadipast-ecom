import { useEffect, useState } from 'react';
import { Check, Truck, Loader2, Package } from 'lucide-react';
import { useRouter } from '@/store/router';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/data/catalog';
import { useCart } from '@/store/cart';

interface OrderData {
  id: string;
  order_number: string | null;
  total: number;
  status: string;
  customer_name: string;
  shipping_method: string;
}

export function CheckoutSuccessPage() {
  const { path } = useRouter();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(path.split('?')[1] ?? '');
  const orderId = params.get('order') ?? '';

  useEffect(() => {
    clearCart();
    (async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, total, status, customer_name, shipping_method')
        .eq('id', orderId)
        .maybeSingle();

      if (!error && data) {
        setOrder(data as OrderData);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return (
      <div className="container-x flex flex-col items-center justify-center gap-4 py-28 text-center">
        <Loader2 size={32} className="animate-spin text-lilac-500" />
        <p className="text-ink-600">A confirmar o teu pagamento…</p>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-sky-100">
          <Check size={36} className="text-sky-600" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink-900">
          Pagamento confirmado!
        </h1>
        <p className="mt-3 text-ink-600">
          Obrigado pela tua compra{order ? `, ${order.customer_name.split(' ')[0]}` : ''}!
          {order && (
            <> A tua encomenda <span className="font-semibold text-ink-900">#{order.order_number ?? order.id.slice(0, 8).toUpperCase()}</span> foi confirmada.</>
          )}
          {' '}Vamos prepará-la com todo o carinho.
        </p>

        {order && (
          <div className="mt-6 rounded-2xl bg-cream-100 p-4 text-left text-sm">
            <p className="flex items-center gap-2 text-ink-700">
              <Truck size={16} className="text-lilac-600" /> Entrega estimada em 24-48h
            </p>
            <p className="mt-2 flex items-center gap-2 text-ink-700">
              <Package size={16} className="text-lilac-600" /> Estado: {order.status}
            </p>
            <p className="mt-2 flex items-center justify-between text-ink-700">
              <span>Total pago</span>
              <span className="font-semibold">{formatPrice(Number(order.total))}</span>
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={() => window.location.hash = '/conta/encomendas'} className="btn-primary">
            Ver as minhas encomendas
          </button>
          <button onClick={() => window.location.hash = '/'} className="btn-secondary">
            Voltar à loja
          </button>
        </div>
      </div>
    </div>
  );
}
