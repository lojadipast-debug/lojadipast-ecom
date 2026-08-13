import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useProducts } from '@/store/products';

export interface AccountUser {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  isAdmin: boolean;
}

export type BuildingType = 'casa' | 'apartamento';

export interface AccountAddress {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  postal: string;
  phone: string;
  country: string;
  buildingType: BuildingType;
  houseNumber: string;
  floor?: string;
  apartmentUnit?: string;
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
  saveProfile: (profile: { name: string; phone: string; birthDate: string }) => Promise<{ ok: boolean; error?: string }>;
  saveAddress: (address: Omit<AccountAddress, 'id'> & { id?: string }) => Promise<{ ok: boolean; error?: string; address?: AccountAddress }>;
  deleteAddress: (id: string) => Promise<{ ok: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

type AddressRow = {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  postal: string;
  phone: string;
  country: string;
  building_type: string | null;
  house_number: string | null;
  floor: string | null;
  apartment_unit: string | null;
};

function mapAddressRow(row: AddressRow): AccountAddress {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    street: row.street,
    city: row.city,
    postal: row.postal,
    phone: row.phone,
    country: row.country,
    buildingType: (row.building_type === 'apartamento' ? 'apartamento' : 'casa') as BuildingType,
    houseNumber: row.house_number ?? '',
    floor: row.floor ?? undefined,
    apartmentUnit: row.apartment_unit ?? undefined,
  };
}

function nameFromEmail(email: string): string {
  const name = email.split('@')[0].replace(/[._-]/g, ' ');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const { getProductById } = useProducts();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
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
  }, [getProductById]);

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
          setUser({ name, email: data.session.user.email ?? '', phone: '', birthDate: '', isAdmin });
          const { data: profile } = await supabase.from('account_profiles').select('name, phone, birth_date').eq('user_id', data.session.user.id).maybeSingle();
          const { data: savedAddresses } = await supabase.from('account_addresses').select('id, label, name, street, city, postal, phone, country, building_type, house_number, floor, apartment_unit').eq('user_id', data.session.user.id).order('created_at', { ascending: false });
          setUser((current) => current ? { ...current, name: profile?.name || current.name, phone: profile?.phone ?? '', birthDate: profile?.birth_date ?? '' } : current);
          setAddresses((savedAddresses ?? []).map(mapAddressRow));
          await refreshOrdersFor(data.session.user.email ?? '');
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
            setUser({ name, email: session.user.email ?? '', phone: '', birthDate: '', isAdmin });
            const { data: profile } = await supabase.from('account_profiles').select('name, phone, birth_date').eq('user_id', session.user.id).maybeSingle();
            const { data: savedAddresses } = await supabase.from('account_addresses').select('id, label, name, street, city, postal, phone, country, building_type, house_number, floor, apartment_unit').eq('user_id', session.user.id).order('created_at', { ascending: false });
            setUser((current) => current ? { ...current, name: profile?.name || current.name, phone: profile?.phone ?? '', birthDate: profile?.birth_date ?? '' } : current);
            setAddresses((savedAddresses ?? []).map(mapAddressRow));
            await refreshOrdersFor(session.user.email ?? '');
          } else {
            setUser(null);
            setAddresses([]);
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

  const saveProfile: AccountContextValue['saveProfile'] = async (profile) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return { ok: false, error: 'A sessão expirou. Entra novamente.' };

    const { error } = await supabase.from('account_profiles').upsert({
      user_id: data.user.id,
      name: profile.name.trim(),
      phone: profile.phone.trim(),
      birth_date: profile.birthDate || null,
      updated_at: new Date().toISOString(),
    });
    if (error) return { ok: false, error: 'Não foi possível guardar os teus dados.' };

    setUser((current) => current ? { ...current, name: profile.name.trim(), phone: profile.phone.trim(), birthDate: profile.birthDate } : current);
    return { ok: true };
  };

  const saveAddress: AccountContextValue['saveAddress'] = async (address) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return { ok: false, error: 'A sessão expirou. Entra novamente.' };

    const payload = {
      ...(address.id ? { id: address.id } : {}),
      user_id: data.user.id,
      label: address.label.trim(),
      name: address.name.trim(),
      street: address.street.trim(),
      city: address.city.trim(),
      postal: address.postal.trim(),
      phone: address.phone.trim(),
      country: address.country.trim(),
      building_type: address.buildingType,
      house_number: address.houseNumber.trim(),
      floor: address.buildingType === 'apartamento' ? (address.floor?.trim() || null) : null,
      apartment_unit: address.buildingType === 'apartamento' ? (address.apartmentUnit?.trim() || null) : null,
      updated_at: new Date().toISOString(),
    };
    const { data: saved, error } = await supabase.from('account_addresses').upsert(payload).select('id, label, name, street, city, postal, phone, country, building_type, house_number, floor, apartment_unit').maybeSingle();
    if (error || !saved) return { ok: false, error: 'Não foi possível guardar a morada.' };

    const nextAddress = mapAddressRow(saved);
    setAddresses((current) => address.id ? current.map((item) => item.id === address.id ? nextAddress : item) : [nextAddress, ...current]);
    return { ok: true, address: nextAddress };
  };

  const deleteAddress: AccountContextValue['deleteAddress'] = async (id) => {
    const { error } = await supabase.from('account_addresses').delete().eq('id', id);
    if (error) return { ok: false, error: 'Não foi possível apagar a morada.' };
    setAddresses((current) => current.filter((address) => address.id !== id));
    return { ok: true };
  };

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
      setUser({ name, email: data.user.email ?? '', phone: '', birthDate: '', isAdmin });
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
        setUser({ name, email, phone: '', birthDate: '', isAdmin: appMeta?.role === 'admin' });
      }

      return { ok: true };
    } catch {
      return { ok: false, error: 'Erro ao criar conta. Tenta novamente.' };
    }
  };

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAddresses([]);
    setOrders([]);
  }, []);

  return (
    <AccountContext.Provider
      value={{ user, loading, addresses, orders, ordersLoading, refreshOrders, saveProfile, saveAddress, deleteAddress, login, register, logout }}
    >
      {children}
    </AccountContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used within AccountProvider');
  return ctx;
}