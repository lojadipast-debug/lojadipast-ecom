import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Sparkles, ShoppingBag } from 'lucide-react';
import { useAccount } from '@/store/account';
import { useRouter } from '@/store/router';

const STORAGE_KEY = 'dipa_signup_popup_dismissed';
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

type Trigger = 'cart' | 'exit' | null;

function shouldShow(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return true;
    return Date.now() - ts >= COOLDOWN_MS;
  } catch {
    return true;
  }
}

function markDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function SignupPopup() {
  const { user, loading } = useAccount();
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState<Trigger>(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (loading || user) return;

    const onPrompt = (e: Event) => {
      const detail = (e as CustomEvent<Trigger>).detail;
      if (!shouldShow()) return;
      setTrigger(detail ?? 'cart');
      setOpen(true);
    };

    const onExit = (e: MouseEvent) => {
      if (e.clientY <= 0 && !user && shouldShow()) {
        setTrigger('exit');
        setOpen(true);
        setExiting(true);
      }
    };

    window.addEventListener('dipa:signup-prompt', onPrompt);
    document.documentElement.addEventListener('mouseout', onExit);

    return () => {
      window.removeEventListener('dipa:signup-prompt', onPrompt);
      document.documentElement.removeEventListener('mouseout', onExit);
    };
  }, [user, loading]);

  useEffect(() => {
    if (!open) setExiting(false);
  }, [open]);

  if (!open) return null;

  const close = () => {
    markDismissed();
    setOpen(false);
  };

  const goAuth = () => {
    markDismissed();
    setOpen(false);
    navigate('/conta/perfil');
  };

  const isCart = trigger === 'cart';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cria a tua conta"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-ink-100 ${
          exiting ? 'animate-fade-in' : 'animate-scale-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Fechar"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-colors hover:bg-cream-100 hover:text-ink-700"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center gap-5 px-7 pb-8 pt-10 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-lilac-200 to-rose-200 shadow-soft">
            {isCart ? <ShoppingBag size={28} className="text-lilac-700" /> : <Sparkles size={28} className="text-lilac-700" />}
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900">
              Cria a tua conta em segundos! <Sparkles size={18} className="inline-block text-lilac-500" />
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Cria conta para guardar os teus artigos e acompanhar a encomenda com 1 clique.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <button onClick={goAuth} className="btn-primary w-full">
              <UserPlus size={16} /> Criar Conta / Entrar
            </button>
            <button onClick={close} className="btn-soft w-full">
              Continuar como convidado
            </button>
          </div>

          <p className="text-xs text-ink-400">
            Recebe 10% na primeira compra · Dados protegidos
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
