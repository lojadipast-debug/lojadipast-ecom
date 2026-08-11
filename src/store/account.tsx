import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useProducts } from '@/store/products';

export interface AccountUser {
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface AccountAddress {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  postal: string;
  phone: string;
}

export interface AccountOrder {
  id: string;
  date: string;
  total: number;
  status: string;
  items: { name: string; qty: number; image: string }[];
}

interface AccountContextValue {
  user: AccountUser | null;
  loading: boolean;
  addresses: AccountAddress[];
  orders: AccountOrder[];
  ordersLoading: boolean;
  refreshOrders: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

const DEMO_ADDRESSES: AccountAddress[] = [
  {
    id: 'addr1',
    label: 'Casa',
    name: 'Sofia Martins',
    street: 'Rua das Flores, 12',
    city: 'Lisboa',
    postal: '1200-190',
    phone: '+351 912 345 678',
  },
];

function nameFromEmail(email: string): string {
  const name = email.split('@')[0].replace(/[._-]/g, ' ');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const { getProductById } = useProducts();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [addresses] = useState<AccountAddress[]>(DEMO_ADDRESSES);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const refreshOrdersFor = useCallback(async (email: string) => {
    if (!email) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, total, status, order_items(product_name, quantity, product_id)')
        .eq('customer_email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      type OrderRow = {
        id: string;
        created_at: string;
        total: number;
        status: string | null;
        order_items: { product_name: string; quantity: number; product_id: string }[];
      };

      const mapped: AccountOrder[] = (data as OrderRow[] | null ?? []).map((row) => ({
        id: `#${String(row.id).slice(0, 8).toUpperCase()}`,
        date: new Date(row.created_at).toLocaleDateString('pt-PT', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        total: Number(row.total),
        status: row.status ?? 'Processamento',
        items: (row.order_items ?? []).map((it) => ({
          name: it.product_name,
          qty: it.quantity,
          image: getProductById(it.product_id)?.images[0] ?? '',
        })),
      }));

      setOrders(mapped);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let settled = false;

    const finish = () => {
      if (!mounted || settled) return;
      settled = true;
      setLoading(false);
    };

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        if (data.session?.user) {
          const meta = data.session.user.user_metadata as Record<string, string> | null;
          const appMeta = data.session.user.app_metadata as Record<string, string> | null;
          const name = meta?.name ?? nameFromEmail(data.session.user.email ?? '');
          const isAdmin = appMeta?.role === 'admin';
          setUser({ name, email: data.session.user.email ?? '', isAdmin });
          refreshOrdersFor(data.session.user.email ?? '');
        }
        finish();
      } catch {
        finish();
      }
    })();

    let sub: { subscription: { unsubscribe: () => void } } | undefined;
    try {
      const result = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        (async () => {
          if (session?.user) {
            const meta = session.user.user_metadata as Record<string, string> | null;
            const appMeta = session.user.app_metadata as Record<string, string> | null;
            const name = meta?.name ?? nameFromEmail(session.user.email ?? '');
            const isAdmin = appMeta?.role === 'admin';
            setUser({ name, email: session.user.email ?? '', isAdmin });
            await refreshOrdersFor(session.user.email ?? '');
          } else {
            setUser(null);
            setOrders([]);
          }
          finish();
        })();
      });
      sub = result.data;
    } catch {
      finish();
    }

    const timeout = setTimeout(finish, 4000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      sub?.subscription.unsubscribe();
    };
  }, [refreshOrdersFor]);

  const refreshOrders = useCallback(async () => {
    if (user?.email) await refreshOrdersFor(user.email);
    else setOrders([]);
  }, [user?.email, refreshOrdersFor]);

  const login: AccountContextValue['login'] = async (email, password) => {
    if (!email || !password) return { ok: false, error: 'Preenche email e palavra-passe.' };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { ok: false, error: 'Email ou palavra-passe incorretos.' };
    }
    if (data.user) {
      const meta = data.user.user_metadata as Record<string, string> | null;
      const appMeta = data.user.app_metadata as Record<string, string> | null;
      const name = meta?.name ?? nameFromEmail(data.user.email ?? '');
      const isAdmin = appMeta?.role === 'admin';
      setUser({ name, email: data.user.email ?? '', isAdmin });
    }
    return { ok: true };
  };

  const register: AccountContextValue['register'] = async (name, email, password) => {
    if (!name || !email || !password) return { ok: false, error: 'Preenche todos os campos.' };
    if (password.length < 6)
      return { ok: false, error: 'A palavra-passe deve ter pelo menos 6 caracteres.' };

    try {
      // Registo direto através do SDK oficial do Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        return { ok: false, error: error.message || 'Erro ao criar conta.' };
      }

      if (data.user) {
        const appMeta = data.user.app_metadata as Record<string, string> | null;
        setUser({ name, email, isAdmin: appMeta?.role === 'admin' });
      }

      return { ok: true };
    } catch {
      return { ok: false, error: 'Erro ao criar conta. Tenta novamente.' };
    }
  };

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOrders([]);
  }, []);

  return (
    <AccountContext.Provider
      value={{ user, loading, addresses, orders, ordersLoading, refreshOrders, login, register, logout }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used within AccountProvider');
  return ctx;
}