import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Loader2,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Check,
  Upload,
  ArrowLeft,
  Image as ImageIcon,
  Palette,
  Ruler,
  Package,
  ChevronDown,
  Tag,
  Calendar,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/store/router';
import { useAccount } from '@/store/account';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { formatPrice, CATEGORY_LABELS } from '@/data/catalog';

type AdminTab = 'products' | 'orders';

const ADMIN_EMAIL = 'blegend1080@gmail.com';

interface ColorOption {
  name: string;
  hex: string;
}

interface AdminProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategory: string | null;
  description: string;
  stock_status: string;
  stock_quantity: number;
  images: string[];
  has_sizes: boolean;
  has_colors: boolean;
  sizes: string[];
  colors: ColorOption[];
  promo_active: boolean;
  promo_original_price: number | null;
  promo_price: number | null;
  promo_start_date: string | null;
  promo_end_date: string | null;
}

interface AdminOrder {
  id: string;
  order_number: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_postal_code: string | null;
  nif: string | null;
  total: number;
  status: string;
  shipping_method: string;
  payment_method: string | null;
  created_at: string;
  order_items?: {
    product_name: string;
    quantity: number;
    unit_price: number;
    size: string;
    color: string;
  }[];
}

type SaveState = 'idle' | 'loading' | 'success' | 'error';

const CATEGORIES = [
  { value: 'bebe', label: 'Bebé' },
  { value: 'menina', label: 'Menina' },
  { value: 'menino', label: 'Menino' },
  { value: 'mochilas', label: 'Mochilas' },
  { value: 'brinquedos', label: 'Brinquedos' },
  { value: 'acessorios', label: 'Acessórios' },
];

const SUBCATEGORIES: Record<string, string[]> = {
  bebe: ['Corpo', 'Conjuntos', 'Camisolas', 'Pijamas', 'Acessórios bebé'],
  menina: ['Vestidos', 'T-shirts', 'Calças', 'Camisolas', 'Saias', 'Conjuntos', 'Acessórios'],
  menino: ['Camisolas', 'T-shirts', 'Calças', 'Conjuntos', 'Pijamas', 'Chapéus', 'Acessórios'],
  mochilas: ['Escola', 'Passeio', 'Saco de desporto', 'Acessórios'],
  brinquedos: ['Pelúcias', 'Educativos', 'Madeira', 'Ao ar livre', 'Livros'],
  acessorios: ['Sapatilhas', 'Chapéus', 'Lenços', 'Malas', 'Outros'],
};

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'preparing', label: 'Em preparação' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelada' },
];

const EMPTY_FORM = {
  id: '',
  name: '',
  price: '',
  category: 'bebe',
  subcategory: '',
  description: '',
  stock_status: 'Disponivel',
  stock_quantity: '10',
  images: [] as string[],
  has_sizes: true,
  has_colors: true,
  sizes: ['Único'] as string[],
  colors: [{ name: 'Padrão', hex: '#cccccc' }] as ColorOption[],
  newSize: '',
  newColorName: '',
  newColorHex: '#d7c6f2',
  promo_active: false,
  promo_original_price: '',
  promo_price: '',
  promo_infinite: true,
  promo_start_date: '',
  promo_end_date: '',
};

export function AdminPage() {
  const { navigate } = useRouter();
  const { user, loading } = useAccount();
  useScrollReveal();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Orders state
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderUpdating, setOrderUpdating] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, category, subcategory, description, stock_status, stock_quantity, images, has_sizes, has_colors, sizes, colors, promo_active, promo_original_price, promo_price, promo_start_date, promo_end_date')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data as AdminProduct[]);
    }
    setLoadingProducts(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_postal_code, nif, total, status, shipping_method, payment_method, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as AdminOrder[]);
    }
    setLoadingOrders(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab, fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setOrderUpdating(orderId);
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    }
    setOrderUpdating(null);
  };

  const filteredOrders = useMemo(() => {
    const q = orderSearch.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter((o) =>
      (o.order_number ?? '').toLowerCase().includes(q) ||
      (o.customer_name ?? '').toLowerCase().includes(q) ||
      (o.customer_email ?? '').toLowerCase().includes(q)
    );
  }, [orders, orderSearch]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const openNewForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(true);
    setSaveState('idle');
    setSaveMessage('');
  };

  const openEditForm = (p: AdminProduct) => {
    const hasDates = !!(p.promo_start_date || p.promo_end_date);
    setForm({
      id: p.id,
      name: p.name,
      price: String(p.price),
      category: p.category,
      subcategory: p.subcategory ?? '',
      description: p.description ?? '',
      stock_status: p.stock_status ?? 'Disponivel',
      stock_quantity: String(p.stock_quantity ?? 0),
      images: p.images ?? [],
      has_sizes: p.has_sizes ?? true,
      has_colors: p.has_colors ?? true,
      sizes: Array.isArray(p.sizes) ? p.sizes : ['Único'],
      colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [{ name: 'Padrão', hex: '#cccccc' }],
      newSize: '',
      newColorName: '',
      newColorHex: '#d7c6f2',
      promo_active: p.promo_active ?? false,
      promo_original_price: p.promo_original_price != null ? String(p.promo_original_price) : '',
      promo_price: p.promo_price != null ? String(p.promo_price) : '',
      promo_infinite: !hasDates,
      promo_start_date: p.promo_start_date ? p.promo_start_date.slice(0, 10) : '',
      promo_end_date: p.promo_end_date ? p.promo_end_date.slice(0, 10) : '',
    });
    setEditingId(p.id);
    setShowForm(true);
    setSaveState('idle');
    setSaveMessage('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setSaveState('idle');
    setSaveMessage('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (form.images.length >= 5) {
      setSaveState('error');
      setSaveMessage('Limite máximo de 5 imagens atingido.');
      return;
    }

    setImageUploading(true);
    setSaveState('idle');
    setSaveMessage('');

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `products/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('products')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('products').getPublicUrl(filePath);

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, urlData.publicUrl].slice(0, 5),
      }));
      setSaveState('success');
      setSaveMessage('Imagem carregada com sucesso!');
    } catch {
      setSaveState('error');
      setSaveMessage('Erro ao carregar imagem. Tenta novamente.');
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState('loading');
    setSaveMessage('');

    const priceNum = parseFloat(form.price);
    if (!form.name.trim() || isNaN(priceNum) || priceNum < 0) {
      setSaveState('error');
      setSaveMessage('Preenche o nome e um preço válido.');
      return;
    }

    const stockQty = Math.max(0, parseInt(form.stock_quantity) || 0);
    const stockStatus = stockQty > 0 ? 'Disponivel' : 'Sem stock';

    const promoPriceNum = form.promo_active ? parseFloat(form.promo_price) : NaN;
    const promoOriginalNum = form.promo_active ? parseFloat(form.promo_original_price) : NaN;
    if (form.promo_active && (isNaN(promoPriceNum) || promoPriceNum < 0)) {
      setSaveState('error');
      setSaveMessage('Define um preço promocional válido.');
      return;
    }
    if (form.promo_active && (isNaN(promoOriginalNum) || promoOriginalNum < 0)) {
      setSaveState('error');
      setSaveMessage('Define o preço original da promoção.');
      return;
    }
    if (form.promo_active && promoPriceNum >= promoOriginalNum) {
      setSaveState('error');
      setSaveMessage('O preço promocional tem de ser menor que o preço original.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: priceNum,
      category: form.category,
      subcategory: form.subcategory || null,
      description: form.description.trim(),
      stock_status: stockStatus,
      stock_quantity: stockQty,
      images: form.images,
      has_sizes: form.has_sizes,
      has_colors: form.has_colors,
      sizes: form.has_sizes ? form.sizes : [],
      colors: form.has_colors ? form.colors : [],
      promo_active: form.promo_active,
      promo_original_price: form.promo_active ? promoOriginalNum : null,
      promo_price: form.promo_active ? promoPriceNum : null,
      promo_start_date: form.promo_active && !form.promo_infinite && form.promo_start_date ? form.promo_start_date : null,
      promo_end_date: form.promo_active && !form.promo_infinite && form.promo_end_date ? form.promo_end_date : null,
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId);
        if (error) throw error;
        setSaveMessage('Produto atualizado com sucesso!');
      } else {
        const newId = `p-${Date.now()}`;
        const { error } = await supabase
          .from('products')
          .insert({ ...payload, id: newId });
        if (error) throw error;
        setSaveMessage('Produto adicionado com sucesso!');
      }

      setSaveState('success');
      await fetchProducts();
      setTimeout(() => closeForm(), 1200);
    } catch {
      setSaveState('error');
      setSaveMessage('Erro ao guardar o produto. Verifica as permissões.');
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
    setConfirmDelete(null);
  };

  if (loading) {
    return (
      <div className="container-x flex min-h-screen items-center justify-center py-10">
        <Loader2 size={28} className="animate-spin text-ink-300" />
      </div>
    );
  }

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="container-x flex min-h-screen flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-rose-100">
          <AlertCircle size={28} className="text-rose-600" />
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink-900">Acesso negado</h1>
        <p className="max-w-sm text-sm text-ink-500">
          Não tens permissão para aceder ao painel de administração. Inicia sessão com uma conta autorizada.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary mt-2">
          <ArrowLeft size={18} /> Voltar à loja
        </button>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      {/* Header */}
      <div className="reveal flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/')}
            className="mb-2 flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-ink-800"
          >
            <ArrowLeft size={14} /> Loja
          </button>
          <h1 className="font-display text-3xl font-semibold text-ink-900">Painel de administração</h1>
          <p className="mt-1 text-sm text-ink-500">Gere os produtos e encomendas da loja Dipa.</p>
        </div>
        {activeTab === 'products' && (
          <button onClick={openNewForm} className="btn-primary">
            <Plus size={18} /> Adicionar produto
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="reveal mt-6 flex gap-2 border-b border-ink-100">
        <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<ImageIcon size={16} />} label="Produtos" />
        <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Package size={16} />} label="Encomendas" />
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <>
          {/* Search */}
          <div className="reveal mt-6">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Pesquisar produtos pelo nome…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Product list */}
          <div className="reveal mt-6">
            {loadingProducts ? (
              <div className="flex items-center justify-center rounded-3xl bg-white py-16 ring-1 ring-ink-100">
                <Loader2 size={24} className="animate-spin text-ink-300" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white py-16 text-center ring-1 ring-ink-100">
                <ImageIcon size={28} className="text-ink-300" />
                <p className="font-display text-lg font-semibold text-ink-900">
                  {search ? 'Nenhum produto encontrado' : 'Ainda sem produtos'}
                </p>
                <p className="text-sm text-ink-500">
                  {search ? 'Tenta outra pesquisa.' : 'Adiciona o primeiro produto da loja.'}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-ink-100">
                <div className="hidden grid-cols-[60px_1fr_120px_140px_140px_80px_120px_100px] gap-4 border-b border-ink-100 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-400 sm:grid">
                  <span>Imagem</span>
                  <span>Nome</span>
                  <span>Preço</span>
                  <span>Categoria</span>
                  <span>Subcategoria</span>
                  <span>Stock</span>
                  <span>Estado</span>
                  <span className="text-right">Ações</span>
                </div>
                <ul className="divide-y divide-ink-100">
                  {filtered.map((p) => (
                    <li
                      key={p.id}
                      className="grid grid-cols-[56px_1fr_auto] items-center gap-4 px-5 py-4 sm:grid-cols-[60px_1fr_120px_140px_140px_80px_120px_100px]"
                    >
                      <div className="h-14 w-14 overflow-hidden rounded-xl bg-cream-100">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-ink-300">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-semibold text-ink-900">{p.name}</p>
                        <div className="mt-0.5 flex items-center gap-2 sm:hidden">
                          <span className="text-sm font-medium text-ink-700">{formatPrice(Number(p.price))}</span>
                          <StockBadge status={p.stock_status} />
                        </div>
                      </div>
                      <span className="hidden text-sm font-semibold text-ink-900 sm:block">
                        {formatPrice(Number(p.price))}
                      </span>
                      <span className="hidden text-sm text-ink-600 sm:block">
                        {CATEGORY_LABELS[p.category as keyof typeof CATEGORY_LABELS] ?? p.category}
                      </span>
                      <span className="hidden text-sm text-ink-600 sm:block">
                        {p.subcategory ?? '—'}
                      </span>
                      <span className="hidden text-center text-sm font-semibold text-ink-700 sm:block">
                        {p.stock_quantity ?? 0}
                      </span>
                      <span className="hidden sm:block">
                        <StockBadge status={p.stock_status} />
                      </span>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(p)}
                          className="grid h-9 w-9 place-items-center rounded-xl bg-cream-100 text-ink-600 transition-colors hover:bg-lilac-100 hover:text-lilac-700"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p.id)}
                          className="grid h-9 w-9 place-items-center rounded-xl bg-cream-100 text-ink-600 transition-colors hover:bg-rose-100 hover:text-rose-600"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <>
          {/* Order search */}
          <div className="reveal mt-6">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Pesquisar por nº encomenda, nome ou email…"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Orders list */}
          <div className="reveal mt-6">
            {loadingOrders ? (
              <div className="flex items-center justify-center rounded-3xl bg-white py-16 ring-1 ring-ink-100">
                <Loader2 size={24} className="animate-spin text-ink-300" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white py-16 text-center ring-1 ring-ink-100">
                <Package size={28} className="text-ink-300" />
                <p className="font-display text-lg font-semibold text-ink-900">
                  {orderSearch ? 'Nenhuma encomenda encontrada' : 'Ainda sem encomendas'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    expanded={expandedOrder === order.id}
                    onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    onStatusChange={(status) => updateOrderStatus(order.id, status)}
                    updating={orderUpdating === order.id}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-900/40 p-4 backdrop-blur-sm sm:p-8">
          <div className="my-auto w-full max-w-2xl rounded-3xl bg-white p-6 shadow-soft-lg sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink-900">
                {editingId ? 'Editar produto' : 'Adicionar produto'}
              </h2>
              <button
                onClick={closeForm}
                className="grid h-9 w-9 place-items-center rounded-full text-ink-400 hover:bg-cream-100 hover:text-ink-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveProduct} className="mt-6 flex flex-col gap-5">
              {/* Image upload */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  Imagens ({form.images.length}/5)
                </span>
                <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-cream-100 ring-1 ring-ink-200">
                    {form.images[0] ? (
                      <img src={form.images[0]} alt="Pré-visualização" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-ink-300">
                        <ImageIcon size={28} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 px-4 py-6 text-sm font-semibold text-ink-500 transition-colors hover:border-lilac-300 hover:text-lilac-600">
                      {imageUploading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> A carregar…
                        </>
                      ) : (
                        <>
                          <Upload size={18} /> Adicionar imagem
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={imageUploading || form.images.length >= 5}
                      />
                    </label>

                    {form.images.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {form.images.map((img, idx) => (
                          <div key={idx} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-ink-200">
                            <img src={img} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute right-0 top-0 grid h-5 w-5 place-items-center rounded-bl-lg bg-ink-900/70 text-white hover:bg-rose-600"
                              title="Remover"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Nome do produto</span>
                <input
                  className="input-field mt-1.5"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Conjunto Nuvenzinha de Algodão"
                  required
                />
              </label>

              {/* Price + Category */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Preço (€)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field mt-1.5"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Categoria</span>
                  <select
                    className="input-field mt-1.5 cursor-pointer"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: '' })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Subcategoria</span>
                  <select
                    className="input-field mt-1.5 cursor-pointer"
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  >
                    <option value="">— Sem subcategoria —</option>
                    {(SUBCATEGORIES[form.category] ?? []).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Description */}
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Descrição</span>
                <textarea
                  className="input-field mt-1.5 min-h-[90px] resize-y"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descreve o produto…"
                />
              </label>

              {/* Stock quantity */}
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Quantidade em stock</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="input-field mt-1.5"
                  value={form.stock_quantity}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value) || 0;
                    setForm({ ...form, stock_quantity: e.target.value, stock_status: qty > 0 ? 'Disponivel' : 'Sem stock' });
                  }}
                  placeholder="0"
                  required
                />
                <p className="mt-1.5 text-xs text-ink-400">
                  {parseInt(form.stock_quantity) > 0
                    ? `Disponível — ${form.stock_quantity} unidade${parseInt(form.stock_quantity) === 1 ? '' : 's'} em stock`
                    : 'Sem stock — o produto aparece como "Esgotado" na loja'}
                </p>
              </label>

              {/* Promo section */}
              <div className="rounded-2xl bg-cream-50 p-4 ring-1 ring-ink-100">
                <ToggleCard
                  icon={<Tag size={16} />}
                  label="Ativar promoção"
                  description="Define um preço promocional com desconto"
                  checked={form.promo_active}
                  onChange={(v) => setForm({ ...form, promo_active: v })}
                />

                {form.promo_active && (
                  <div className="mt-4 flex flex-col gap-4">
                    {/* Prices */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Preço original (€)</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="input-field mt-1.5"
                          value={form.promo_original_price}
                          onChange={(e) => setForm({ ...form, promo_original_price: e.target.value })}
                          placeholder="0.00"
                          required
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Preço promocional (€)</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="input-field mt-1.5"
                          value={form.promo_price}
                          onChange={(e) => setForm({ ...form, promo_price: e.target.value })}
                          placeholder="0.00"
                          required
                        />
                      </label>
                    </div>

                    {/* Discount preview */}
                    {form.promo_original_price && form.promo_price &&
                      parseFloat(form.promo_original_price) > parseFloat(form.promo_price) && (
                      <div className="flex items-center gap-2 rounded-xl bg-rose-100 px-4 py-2.5 text-sm font-bold text-rose-700">
                        <Tag size={15} />
                        Desconto de {Math.round((1 - parseFloat(form.promo_price) / parseFloat(form.promo_original_price)) * 100)}%
                      </div>
                    )}

                    {/* Duration toggle */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, promo_infinite: true })}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                          form.promo_infinite ? 'bg-lilac-200 text-lilac-800' : 'bg-white text-ink-500 ring-1 ring-ink-200'
                        }`}
                      >
                        <InfinityIcon size={16} /> Tempo infinito
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, promo_infinite: false })}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                          !form.promo_infinite ? 'bg-lilac-200 text-lilac-800' : 'bg-white text-ink-500 ring-1 ring-ink-200'
                        }`}
                      >
                        <Calendar size={16} /> Datas definidas
                      </button>
                    </div>

                    {/* Date pickers */}
                    {!form.promo_infinite && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Início</span>
                          <input
                            type="date"
                            className="input-field mt-1.5"
                            value={form.promo_start_date}
                            onChange={(e) => setForm({ ...form, promo_start_date: e.target.value })}
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Fim</span>
                          <input
                            type="date"
                            className="input-field mt-1.5"
                            value={form.promo_end_date}
                            onChange={(e) => setForm({ ...form, promo_end_date: e.target.value })}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Variation toggles */}
              <div className="grid gap-4 sm:grid-cols-2">
                <ToggleCard
                  icon={<Ruler size={16} />}
                  label="Tamanhos"
                  description="Ativar variações de tamanho"
                  checked={form.has_sizes}
                  onChange={(v) => setForm({ ...form, has_sizes: v })}
                />
                <ToggleCard
                  icon={<Palette size={16} />}
                  label="Cores"
                  description="Ativar variações de cor"
                  checked={form.has_colors}
                  onChange={(v) => setForm({ ...form, has_colors: v })}
                />
              </div>

              {/* Size editor */}
              {form.has_sizes && (
                <div className="rounded-2xl bg-cream-50 p-4 ring-1 ring-ink-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Tamanhos disponíveis</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.sizes.map((s, i) => (
                      <span key={`${s}-${i}`} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink-800 ring-1 ring-ink-200">
                        {s}
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, sizes: prev.sizes.filter((_, idx) => idx !== i) }))}
                          className="grid h-5 w-5 place-items-center rounded-full text-ink-400 hover:bg-rose-100 hover:text-rose-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {form.sizes.length === 0 && (
                      <p className="text-sm text-ink-400">Sem tamanhos. Adiciona um abaixo.</p>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      className="input-field flex-1"
                      value={form.newSize}
                      onChange={(e) => setForm({ ...form, newSize: e.target.value })}
                      placeholder="Ex: S, M, L, 2A, 4A…"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = form.newSize.trim();
                          if (val && !form.sizes.includes(val)) {
                            setForm((prev) => ({ ...prev, sizes: [...prev.sizes, val], newSize: '' }));
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = form.newSize.trim();
                        if (val && !form.sizes.includes(val)) {
                          setForm((prev) => ({ ...prev, sizes: [...prev.sizes, val], newSize: '' }));
                        }
                      }}
                      className="btn-soft shrink-0"
                    >
                      <Plus size={16} /> Adicionar
                    </button>
                  </div>
                </div>
              )}

              {/* Color editor */}
              {form.has_colors && (
                <div className="rounded-2xl bg-cream-50 p-4 ring-1 ring-ink-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Cores disponíveis</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.colors.map((c, i) => (
                      <span key={`${c.name}-${i}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink-800 ring-1 ring-ink-200">
                        <span className="h-4 w-4 rounded-full ring-1 ring-ink-200" style={{ backgroundColor: c.hex }} />
                        {c.name}
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, colors: prev.colors.filter((_, idx) => idx !== i) }))}
                          className="grid h-5 w-5 place-items-center rounded-full text-ink-400 hover:bg-rose-100 hover:text-rose-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {form.colors.length === 0 && (
                      <p className="text-sm text-ink-400">Sem cores. Adiciona uma abaixo.</p>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="color"
                      value={form.newColorHex}
                      onChange={(e) => setForm({ ...form, newColorHex: e.target.value })}
                      className="h-11 w-16 shrink-0 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                      aria-label="Cor (hex)"
                    />
                    <input
                      className="input-field flex-1"
                      value={form.newColorName}
                      onChange={(e) => setForm({ ...form, newColorName: e.target.value })}
                      placeholder="Nome da cor (ex: Lilás pastel)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const name = form.newColorName.trim();
                          if (name && !form.colors.some((c) => c.name === name)) {
                            setForm((prev) => ({ ...prev, colors: [...prev.colors, { name, hex: prev.newColorHex }], newColorName: '' }));
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const name = form.newColorName.trim();
                        if (name && !form.colors.some((c) => c.name === name)) {
                          setForm((prev) => ({ ...prev, colors: [...prev.colors, { name, hex: prev.newColorHex }], newColorName: '' }));
                        }
                      }}
                      className="btn-soft shrink-0"
                    >
                      <Plus size={16} /> Adicionar
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {saveState !== 'idle' && saveMessage && (
                <div
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
                    saveState === 'success'
                      ? 'bg-sky-50 text-sky-700'
                      : saveState === 'error'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-lilac-50 text-lilac-700'
                  }`}
                >
                  {saveState === 'success' && <Check size={16} />}
                  {saveState === 'error' && <AlertCircle size={16} />}
                  {saveState === 'loading' && <Loader2 size={16} className="animate-spin" />}
                  {saveMessage}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button type="submit" disabled={saveState === 'loading'} className="btn-primary flex-1 disabled:opacity-60">
                  {saveState === 'loading'
                    ? 'A guardar…'
                    : editingId
                    ? 'Guardar alterações'
                    : 'Adicionar produto'}
                </button>
                <button type="button" onClick={closeForm} className="btn-soft">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-soft-lg">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-100">
              <Trash2 size={24} className="text-rose-600" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">Eliminar produto?</h3>
            <p className="mt-2 text-sm text-ink-600">
              Esta ação não pode ser desfeita. O produto será removido permanentemente da loja.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => deleteProduct(confirmDelete)}
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
    </div>
  );
}

function ToggleCard({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 rounded-2xl p-4 text-left ring-1 transition-all ${
        checked ? 'bg-lilac-50 ring-lilac-300' : 'bg-white ring-ink-200'
      }`}
    >
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${checked ? 'bg-lilac-200 text-lilac-700' : 'bg-ink-100 text-ink-400'}`}>
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-bold text-ink-900">{label}</p>
        <p className="text-xs text-ink-500">{description}</p>
      </div>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-lilac-500' : 'bg-ink-200'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

function StockBadge({ status }: { status: string }) {
  const inStock = status !== 'Sem stock';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {inStock ? 'Disponível' : 'Sem stock'}
    </span>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
        active ? 'border-lilac-500 text-ink-900' : 'border-transparent text-ink-400 hover:text-ink-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-sky-50 text-sky-700',
  preparing: 'bg-lilac-50 text-lilac-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-rose-50 text-rose-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  preparing: 'Em preparação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelada',
};

function OrderRow({
  order,
  expanded,
  onToggle,
  onStatusChange,
  updating,
}: {
  order: AdminOrder;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: string) => void;
  updating: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-sm font-bold text-ink-900">
              #{order.order_number ?? '—'}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status] ?? 'bg-ink-50 text-ink-600'}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-ink-600">{order.customer_name} · {order.customer_email}</p>
          <p className="mt-0.5 text-xs text-ink-400">
            {new Date(order.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <span className="text-sm font-bold text-ink-900">{formatPrice(Number(order.total))}</span>
        <ChevronDown size={18} className={`shrink-0 text-ink-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-ink-100 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Cliente</p>
              <dl className="mt-2 space-y-1 text-sm text-ink-700">
                <div><dt className="inline font-medium text-ink-500">Nome: </dt><dd className="inline">{order.customer_name}</dd></div>
                <div><dt className="inline font-medium text-ink-500">Email: </dt><dd className="inline">{order.customer_email}</dd></div>
                <div><dt className="inline font-medium text-ink-500">Telemóvel: </dt><dd className="inline">{order.customer_phone ?? '—'}</dd></div>
                <div><dt className="inline font-medium text-ink-500">Morada: </dt><dd className="inline">{order.customer_address ?? '—'}, {order.customer_city ?? '—'} {order.customer_postal_code ?? ''}</dd></div>
                <div><dt className="inline font-medium text-ink-500">NIF: </dt><dd className="inline">{order.nif ?? '—'}</dd></div>
              </dl>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Estado da encomenda</p>
              <div className="mt-2 flex items-center gap-2">
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(e.target.value)}
                  disabled={updating}
                  className="input-field flex-1 cursor-pointer disabled:opacity-50"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {updating && <Loader2 size={16} className="animate-spin text-ink-400" />}
              </div>
              <dl className="mt-3 space-y-1 text-sm text-ink-700">
                <div><dt className="inline font-medium text-ink-500">Pagamento: </dt><dd className="inline">{order.payment_method ?? '—'}</dd></div>
                <div><dt className="inline font-medium text-ink-500">Envio: </dt><dd className="inline">{order.shipping_method ?? '—'}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
