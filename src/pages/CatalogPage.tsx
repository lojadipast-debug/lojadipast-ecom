import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useRouter } from '@/store/router';
import { CATEGORY_LABELS, AGE_LABELS, BRANDS } from '@/data/catalog';
import type { Category, AgeGroup, BrandName } from '@/data/catalog';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useProducts } from '@/store/products';

type SortKey = 'novidades' | 'maisvendidos' | 'precoasc' | 'precodesc';

const SORT_LABELS: Record<SortKey, string> = {
  novidades: 'Novidades',
  maisvendidos: 'Mais vendidos',
  precoasc: 'Preço: menor',
  precodesc: 'Preço: maior',
};

const ALL_CATEGORIES: Category[] = ['bebe', 'menina', 'menino', 'mochilas', 'brinquedos', 'acessorios'];
const ALL_AGES: AgeGroup[] = ['0-3m', '3-12m', '1-3a', '3-6a', '6-10a'];

export function CatalogPage({ category }: { category?: string }) {
  useScrollReveal();
  const { navigate } = useRouter();
  const { products, loading, error } = useProducts();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedCats, setSelectedCats] = useState<Set<Category>>(
    new Set(category && category in CATEGORY_LABELS ? [category as Category] : [])
  );
  const [selectedAges, setSelectedAges] = useState<Set<AgeGroup>>(new Set());
  const [selectedBrands, setSelectedBrands] = useState<Set<BrandName>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [sort, setSort] = useState<SortKey>('novidades');

  const special = category === 'novidades' || category === 'promocoes';

  useEffect(() => {
    if (special) {
      setSelectedCats(new Set());
      return;
    }
    if (category && category in CATEGORY_LABELS) {
      setSelectedCats(new Set([category as Category]));
    } else {
      setSelectedCats(new Set());
    }
    setSelectedAges(new Set());
    setSelectedBrands(new Set());
    setSelectedColors(new Set());
    setSelectedSizes(new Set());
    setOnlyPromo(false);
    setOnlyNew(false);
  }, [category, special]);

  const toggle = <T,>(set: Set<T>, value: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    setter(next);
  };

  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => p.colors.forEach((c) => map.set(c.name, c.hex)));
    return Array.from(map, ([name, hex]) => ({ name, hex }));
  }, [products]);

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];

    if (special && category === 'novidades') list = list.filter((p) => p.isNew);
    if (special && category === 'promocoes') list = list.filter((p) => p.isPromo);
    if (!special && selectedCats.size > 0)
      list = list.filter((p) => selectedCats.has(p.category));
    if (selectedAges.size > 0) list = list.filter((p) => selectedAges.has(p.ageGroup));
    if (selectedBrands.size > 0) list = list.filter((p) => selectedBrands.has(p.brand));
    if (selectedColors.size > 0)
      list = list.filter((p) => p.colors.some((c) => selectedColors.has(c.name)));
    if (selectedSizes.size > 0)
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.has(s)));
    if (onlyPromo) list = list.filter((p) => p.isPromo);
    if (onlyNew) list = list.filter((p) => p.isNew);

    switch (sort) {
      case 'maisvendidos':
        list.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      case 'precoasc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'precodesc':
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        list.sort((a, b) => Number(b.isNew ?? 0) - Number(a.isNew ?? 0));
    }
    return list;
  }, [
    special,
    category,
    selectedCats,
    selectedAges,
    selectedBrands,
    selectedColors,
    selectedSizes,
    onlyPromo,
    onlyNew,
    sort,
    products,
  ]);

  const title = special
    ? category === 'novidades'
      ? 'Novidades'
      : 'Promoções'
    : category && category in CATEGORY_LABELS
    ? CATEGORY_LABELS[category as Category]
    : 'Catálogo';

  const clearAll = () => {
    if (!special && category && category in CATEGORY_LABELS) {
      setSelectedCats(new Set([category as Category]));
    } else {
      setSelectedCats(new Set());
    }
    setSelectedAges(new Set());
    setSelectedBrands(new Set());
    setSelectedColors(new Set());
    setSelectedSizes(new Set());
    setOnlyPromo(false);
    setOnlyNew(false);
  };

  const activeCount =
    selectedAges.size +
    selectedBrands.size +
    selectedColors.size +
    selectedSizes.size +
    (onlyPromo ? 1 : 0) +
    (onlyNew ? 1 : 0);

  return (
    <div className="container-x py-10">
      {/* breadcrumb + title */}
      <nav className="reveal flex items-center gap-2 text-xs text-ink-400">
        <button onClick={() => navigate('/')} className="hover:text-ink-700">
          Início
        </button>
        <span>/</span>
        <button onClick={() => navigate('/catalogo')} className="hover:text-ink-700">
          Catálogo
        </button>
        {category && (
          <>
            <span>/</span>
            <span className="text-ink-700">{title}</span>
          </>
        )}
      </nav>

      <div className="reveal mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-2 text-ink-500">
            {filtered.length} {filtered.length === 1 ? 'peça' : 'peças'} encontradas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 ring-1 ring-ink-200 lg:hidden"
          >
            <SlidersHorizontal size={16} /> Filtros
            {activeCount > 0 && (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-lilac-500 text-[10px] text-white">
                {activeCount}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none rounded-full bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-ink-700 ring-1 ring-ink-200 outline-none focus:ring-lilac-400"
              aria-label="Ordenar por"
            >
              {Object.entries(SORT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  Ordenar: {v}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 rounded-3xl bg-white py-20 text-center text-sm text-ink-500 ring-1 ring-ink-100">
          A carregar o catálogo…
        </div>
      ) : error ? (
        <div className="mt-8 rounded-3xl bg-white py-20 text-center text-sm text-rose-600 ring-1 ring-rose-100">
          Não foi possível carregar o catálogo. Tenta novamente mais tarde.
        </div>
      ) : (
      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* desktop filters */}
        <aside className="hidden lg:block">
          <FilterPanel
            allColors={allColors}
            allSizes={allSizes}
            selectedCats={selectedCats}
            selectedAges={selectedAges}
            selectedBrands={selectedBrands}
            selectedColors={selectedColors}
            selectedSizes={selectedSizes}
            onlyPromo={onlyPromo}
            onlyNew={onlyNew}
            special={special}
            onToggleCat={(c) => toggle(selectedCats, c, setSelectedCats)}
            onToggleAge={(a) => toggle(selectedAges, a, setSelectedAges)}
            onToggleBrand={(b) => toggle(selectedBrands, b, setSelectedBrands)}
            onToggleColor={(c) => toggle(selectedColors, c, setSelectedColors)}
            onToggleSize={(s) => toggle(selectedSizes, s, setSelectedSizes)}
            onPromo={() => setOnlyPromo((v) => !v)}
            onNew={() => setOnlyNew((v) => !v)}
            onClear={clearAll}
            activeCount={activeCount}
          />
        </aside>

        {/* products */}
        <div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white py-20 text-center ring-1 ring-ink-100">
              <p className="font-display text-xl font-semibold text-ink-900">Nada encontrado</p>
              <p className="text-sm text-ink-500">Tenta ajustar os filtros.</p>
              <button onClick={clearAll} className="btn-soft mt-2">
                Limpar filtros
              </button>
            </div>
          ) : (
            <div
              key={`grid-${selectedCats.size}-${selectedAges.size}-${selectedBrands.size}-${selectedColors.size}-${selectedSizes.size}-${onlyPromo}-${onlyNew}-${sort}`}
              className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4"
            >
              {filtered.map((p, i) => (
                <div key={p.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}>
                  <ProductCard product={p} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* mobile filters drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] animate-fade-up overflow-y-auto rounded-t-4xl bg-cream-50 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink-900">Filtros</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-ink-50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4">
              <FilterPanel
                allColors={allColors}
                allSizes={allSizes}
                selectedCats={selectedCats}
                selectedAges={selectedAges}
                selectedBrands={selectedBrands}
                selectedColors={selectedColors}
                selectedSizes={selectedSizes}
                onlyPromo={onlyPromo}
                onlyNew={onlyNew}
                special={special}
                onToggleCat={(c) => toggle(selectedCats, c, setSelectedCats)}
                onToggleAge={(a) => toggle(selectedAges, a, setSelectedAges)}
                onToggleBrand={(b) => toggle(selectedBrands, b, setSelectedBrands)}
                onToggleColor={(c) => toggle(selectedColors, c, setSelectedColors)}
                onToggleSize={(s) => toggle(selectedSizes, s, setSelectedSizes)}
                onPromo={() => setOnlyPromo((v) => !v)}
                onNew={() => setOnlyNew((v) => !v)}
                onClear={clearAll}
                activeCount={activeCount}
              />
            </div>
            <button
              onClick={() => setFiltersOpen(false)}
              className="btn-primary mt-5 w-full"
            >
              Ver {filtered.length} resultados
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterPanelProps {
  allColors: { name: string; hex: string }[];
  allSizes: string[];
  selectedCats: Set<Category>;
  selectedAges: Set<AgeGroup>;
  selectedBrands: Set<BrandName>;
  selectedColors: Set<string>;
  selectedSizes: Set<string>;
  onlyPromo: boolean;
  onlyNew: boolean;
  special: boolean;
  onToggleCat: (c: Category) => void;
  onToggleAge: (a: AgeGroup) => void;
  onToggleBrand: (b: BrandName) => void;
  onToggleColor: (c: string) => void;
  onToggleSize: (s: string) => void;
  onPromo: () => void;
  onNew: () => void;
  onClear: () => void;
  activeCount: number;
}

function FilterPanel(props: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-semibold uppercase tracking-wider text-ink-900">
          Filtros
        </p>
        {props.activeCount > 0 && (
          <button onClick={props.onClear} className="text-xs font-semibold text-lilac-600 hover:underline">
            Limpar ({props.activeCount})
          </button>
        )}
      </div>

      {!props.special && (
        <FilterGroup title="Categoria">
          {ALL_CATEGORIES.map((c) => (
            <CheckRow
              key={c}
              label={CATEGORY_LABELS[c]}
              checked={props.selectedCats.has(c)}
              onChange={() => props.onToggleCat(c)}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Idade">
        {ALL_AGES.map((a) => (
          <CheckRow
            key={a}
            label={AGE_LABELS[a]}
            checked={props.selectedAges.has(a)}
            onChange={() => props.onToggleAge(a)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Tamanho">
        <div className="flex flex-wrap gap-2">
          {props.allSizes.map((s) => (
            <SizeChip
              key={s}
              label={s}
              active={props.selectedSizes.has(s)}
              onClick={() => props.onToggleSize(s)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Cor">
        <div className="flex flex-wrap gap-2">
          {props.allColors.map((c) => {
            const active = props.selectedColors.has(c.name);
            return (
              <button
                key={c.name}
                onClick={() => props.onToggleColor(c.name)}
                aria-label={c.name}
                className={`relative h-8 w-8 rounded-full ring-2 transition-all ${
                  active ? 'ring-lilac-500 ring-offset-2 ring-offset-cream-50' : 'ring-ink-200'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {active && (
                  <Check
                    size={14}
                    className="absolute inset-0 m-auto text-ink-900 mix-blend-difference"
                  />
                )}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Marca">
        {BRANDS.map((b) => (
          <CheckRow
            key={b}
            label={b}
            checked={props.selectedBrands.has(b)}
            onChange={() => props.onToggleBrand(b)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Destaque">
        <CheckRow label="Novidades" checked={props.onlyNew} onChange={props.onNew} />
        <CheckRow label="Em promoção" checked={props.onlyPromo} onChange={props.onPromo} />
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-ink-100 pt-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">{title}</p>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button onClick={onChange} className="flex items-center gap-2.5 text-left">
      <span
        className={`grid h-5 w-5 place-items-center rounded-md border transition-all ${
          checked
            ? 'border-lilac-500 bg-lilac-500 text-white'
            : 'border-ink-300 bg-white'
        }`}
      >
        {checked && <Check size={13} strokeWidth={3} />}
      </span>
      <span className={`text-sm transition-colors ${checked ? 'font-semibold text-ink-900' : 'text-ink-600'}`}>
        {label}
      </span>
    </button>
  );
}

function SizeChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`min-w-9 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
        active
          ? 'bg-ink-900 text-white'
          : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:ring-lilac-300'
      }`}
    >
      {label}
    </button>
  );
}
