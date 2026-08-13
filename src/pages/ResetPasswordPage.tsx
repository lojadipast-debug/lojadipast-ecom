import { useState, useEffect } from 'react';
import { Lock, Loader2, Check, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/store/router';

export function ResetPasswordPage() {
  const { navigate } = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    const hash = window.location.hash.replace(/^#\/?/, '');
    const params = new URLSearchParams(hash.split('?')[1] ?? hash);
    const accessToken = params.get('access_token');
    const type = params.get('type');

    if (type === 'recovery' || accessToken) {
      setReady(true);
    } else {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setReady(true);
      });
    }

    const t = setTimeout(() => setReady(true), 1500);
    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || 'Não foi possível atualizar a palavra-passe.');
        return;
      }

      await supabase.auth.signOut();
      setDone(true);
      setTimeout(() => navigate('/conta/perfil'), 3000);
    } catch {
      setError('Algo correu mal. Tenta novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="container-x py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-sky-100">
            <Check size={36} className="text-sky-600" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-semibold text-ink-900">
            Palavra-passe alterada com sucesso!
          </h1>
          <p className="mt-3 text-ink-600">
            A tua sessão foi terminada por segurança. Vais ser redirecionado para o login em 3 segundos.
          </p>
          <button onClick={() => navigate('/conta/perfil')} className="btn-primary mt-8">
            Ir para o login <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="container-x flex flex-col items-center justify-center gap-4 py-28 text-center">
        <Loader2 size={32} className="animate-spin text-lilac-500" />
        <p className="text-ink-600">A preparar a redefinição…</p>
      </div>
    );
  }

  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-4xl bg-white shadow-soft ring-1 ring-ink-100">
          <div className="flex items-center gap-3 bg-lilac-100 px-6 py-5">
            <Lock size={22} className="text-lilac-700" />
            <div>
              <h1 className="font-display text-lg font-semibold text-ink-900">Redefinir palavra-passe</h1>
              <p className="text-sm text-ink-600">Define a tua nova palavra-passe</p>
            </div>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4 p-6">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Nova palavra-passe</span>
              <input
                type="password"
                className="input-field mt-1.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Confirmar nova palavra-passe</span>
              <input
                type="password"
                className="input-field mt-1.5"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> A guardar…
                </span>
              ) : (
                <>Guardar nova palavra-passe <ChevronRight size={16} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
