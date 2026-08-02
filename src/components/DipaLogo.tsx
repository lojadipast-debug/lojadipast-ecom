interface LogoProps {
  className?: string;
  withWordmark?: boolean;
  variant?: 'full' | 'mark';
  tone?: 'brand' | 'mono';
}

export function DipaLogo({ className = '', withWordmark = true, variant = 'full', tone = 'brand' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <DipaMark className="h-10 w-10 shrink-0" />
      {variant === 'full' && withWordmark && (
        <span className="flex items-stretch gap-[3px]">
          {(['d', 'i', 'p', 'a'] as const).map((letter, i) => (
            <DipaCube key={letter} letter={letter} tone={i} brand={tone === 'brand'} />
          ))}
        </span>
      )}
    </span>
  );
}

function DipaMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 56" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="dipa-balloon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f5b3d0" />
          <stop offset="1" stopColor="#ec8db4" />
        </linearGradient>
        <linearGradient id="dipa-dress" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0d4f6" />
          <stop offset="1" stopColor="#c8d9f8" />
        </linearGradient>
      </defs>

      <path d="M20 27c-3 0-4.6-3-4.6-7 0-4 1.8-7 4.6-7 2.5 0 3.6 2.2 3.6 5" stroke="#9d7df5" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M36 27c3 0 4.6-3 4.6-7 0-4-1.8-7-4.6-7-2.5 0-3.6 2.2-3.6 5" stroke="#9d7df5" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M20 20c-1 0-1.6-1.4-1.6-3.2 0-1.8.6-3.2 1.6-3.2" stroke="#fad4e6" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M36 20c1 0 1.6-1.4 1.6-3.2 0-1.8-.6-3.2-1.6-3.2" stroke="#fad4e6" strokeWidth="1.8" strokeLinecap="round" />

      <ellipse cx="28" cy="32" rx="10.5" ry="9.5" fill="#fff" stroke="#9d7df5" strokeWidth="2.3" />

      <path d="M19 38c0 6 4 11 9 11s9-5 9-11c0-2-2-3.5-4-3.5h-10c-2 0-4 1.5-4 3.5z" fill="url(#dipa-dress)" stroke="#9d7df5" strokeWidth="2" />
      <circle cx="24" cy="42" r="1.1" fill="#9d7df5" opacity="0.5" />
      <circle cx="29" cy="44" r="1.1" fill="#ec8db4" opacity="0.6" />
      <circle cx="33" cy="41" r="1.1" fill="#9d7df5" opacity="0.5" />
      <circle cx="27" cy="46" r="0.9" fill="#ec8db4" opacity="0.5" />

      <circle cx="24.5" cy="31" r="1.5" fill="#3c3c44" />
      <circle cx="31.5" cy="31" r="1.5" fill="#3c3c44" />
      <circle cx="25" cy="30.5" r="0.5" fill="#fff" />
      <circle cx="32" cy="30.5" r="0.5" fill="#fff" />
      <path d="M26.5 35c1 1 2 1 3 0" stroke="#ec8db4" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="22" cy="34" rx="2" ry="1.4" fill="#fad4e6" opacity="0.75" />
      <ellipse cx="34" cy="34" rx="2" ry="1.4" fill="#fad4e6" opacity="0.75" />

      <path d="M38 31c0-1.5-3-2 0-5.5" stroke="#ec8db4" strokeWidth="1.5" strokeLinecap="round" />

      <path d="M38 9c-2.2-3-6.6-1.4-6.6 2.4 0 3 4 5.2 6.6 7.6 2.6-2.4 6.6-4.6 6.6-7.6 0-3.8-4.4-5.4-6.6-2.4z" fill="url(#dipa-balloon)" />
      <path d="M35.5 9.6c-.8.6-1.2 1.6-1 2.8" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

const CUBE_BRAND = [
  'bg-lilac-300 text-ink-900 ring-lilac-400/50',
  'bg-sky-300 text-ink-900 ring-sky-400/50',
  'bg-rose-300 text-ink-900 ring-rose-400/50',
  'bg-cream-300 text-ink-900 ring-cream-400/50',
];
const CUBE_MONO = [
  'bg-ink-900 text-white ring-ink-700',
  'bg-ink-900 text-white ring-ink-700',
  'bg-ink-900 text-white ring-ink-700',
  'bg-ink-900 text-white ring-ink-700',
];

function DipaCube({ letter, tone, brand }: { letter: string; tone: number; brand: boolean }) {
  const cls = brand ? CUBE_BRAND[tone % CUBE_BRAND.length] : CUBE_MONO[tone % CUBE_MONO.length];
  return (
    <span
      className={`grid h-9 w-9 place-items-center rounded-xl font-display text-lg font-extrabold lowercase ring-1 transition-transform duration-300 hover:-translate-y-1 hover:rotate-2 ${cls}`}
      style={{ boxShadow: '0 4px 10px -4px rgba(0,0,0,0.15)' }}
    >
      {letter}
    </span>
  );
}
