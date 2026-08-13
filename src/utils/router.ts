export type Route =
  | { name: 'home' }
  | { name: 'catalog'; category?: string }
  | { name: 'product'; id: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'checkout-success' }
  | { name: 'account'; section: string }
  | { name: 'reset-password' }
  | { name: 'admin' };

export function parseRoute(path: string): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const pathname = window.location.pathname.replace(/^\//, '');
  const currentPath = hash || pathname || path;

  const clean = currentPath.split('?')[0];
  const segments = clean.split('/').filter(Boolean);

  if (segments.length === 0) return { name: 'home' };

  if (segments.includes('admin')) return { name: 'admin' };
  if (segments[0] === 'catalogo') return { name: 'catalog', category: segments[1] };
  if (segments[0] === 'produto' && segments[1]) return { name: 'product', id: segments[1] };
  if (segments[0] === 'carrinho') return { name: 'cart' };
  if (segments[0] === 'checkout') return { name: 'checkout' };
  if (segments[0] === 'checkout-success') return { name: 'checkout-success' };
  if (segments[0] === 'conta') return { name: 'account', section: segments[1] ?? 'perfil' };
  if (segments[0] === 'reset-password') return { name: 'reset-password' };

  return { name: 'home' };
}
