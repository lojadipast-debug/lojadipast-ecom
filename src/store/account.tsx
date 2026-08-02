import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getProductById } from '@/data/catalog';

export interface AccountUser {
  name: string;
  email: string;
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
  addresses: AccountAddress[];
  orders: AccountOrder[];
  ordersLoading: boolean;
  refreshOrders: () => Promise<void>;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AccountContext = createContext<AccountContextValue | null>(null);
const USER_KEY = 'dipa-user';

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

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(() =>
    readStored<AccountUser | null>(USER_KEY, null)
  );
  const [addresses] = useState<AccountAddress[]>(DEMO_ADDRESSES);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const refreshOrders = useCallback(async () => {
    if (!user?.email) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, total, status, order_items(product_name, quantity, product_id)')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: AccountOrder[] = (data ?? []).map((row: any) => ({
        id: `#${String(row.id).slice(0, 8).toUpperCase()}`,
        date: new Date(row.created_at).toLocaleDateString('pt-PT', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        total: Number(row.total),
        status: row.status ?? 'Processamento',
        items: (row.order_items ?? []).map((it: any) => ({
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
  }, [user?.email]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const login: AccountContextValue['login'] = (email, password) => {
    if (!email || !password) return { ok: false, error: 'Preenche email e palavra-passe.' };
    if (password.length < 4)
      return { ok: false, error: 'A palavra-passe deve ter pelo menos 4 caracteres.' };
    const name = email.split('@')[0].replace(/[._-]/g, ' ');
    setUser({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
    });
    return { ok: true };
  };

  const register: AccountContextValue['register'] = (name, email, password) => {
    if (!name || !email || !password) return { ok: false, error: 'Preenche todos os campos.' };
    if (password.length < 4)
      return { ok: false, error: 'A palavra-passe deve ter pelo menos 4 caracteres.' };
    setUser({ name, email });
    return { ok: true };
  };

  const logout = () => setUser(null);

  return (
    <AccountContext.Provider
      value={{ user, addresses, orders, ordersLoading, refreshOrders, login, register, logout }}
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
