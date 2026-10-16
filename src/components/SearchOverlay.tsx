import { useEffect, useMemo, useState } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { useRouter } from '@/store/router';
import { formatPrice, CATEGORY_LABELS } from '@/data/catalog';
import { useProducts } from '@/store/products';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SUGGESTED = ['Conjunto', 'Mochila', 'Urso', 'Vestido', 'Sapatilhas'];

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const { navigate } = useRouter();
  const { products } = useProducts();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        CATEGORY_LABELS[p.category].toLowerCase().includes(q)
    ).slice(0, 5);
  }, [query, products]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-20">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl animate-scale-in overflow-hidden rounded-3xl bg-white shadow-soft-lg ring-1 ring-ink-100">
        <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
          <Search size={20} className="text-ink-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O que procuras para os mais pequenos?"
            className="flex-1 bg-transparent text-base text-ink-800 placeholder-ink-400 outline-none"
          />
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-ink-50"
            aria-label="Fechar pesquisa"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {!query && (
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-400">
                <TrendingUp size={14} /> Pesquisas populares
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="rounded-full bg-cream-100 px-3.5 py-1.5 text-sm font-medium text-ink-700 ring-1 ring-ink-200/60 transition-colors hover:bg-lilac-100 hover:text-lilac-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && (
            <p className="py-8 text-center text-sm text-ink-500">
              Sem resultados para "{query}". Tenta outra palavra.
            </p>
          )}

          {results.length > 0 && (
            <ul className="flex flex-col gap-1">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => {
                      navigate(`/produto/${p.id}`);
                      onClose();
                    }}
                    className="flex w-full items-center gap-4 rounded-2xl p-2 text-left transition-colors hover:bg-cream-100"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">{p.name}</p>
                      <p className="text-xs text-ink-500">
                        {p.brand} · {CATEGORY_LABELS[p.category]}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-ink-700">
                      {formatPrice(p.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
