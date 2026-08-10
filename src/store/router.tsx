import { useState, useEffect } from 'react';

export type Route = string;

function getPathFromHash(): string {
  const hash = window.location.hash.replace('#', '');
  if (!hash || hash === '/') return '/';
  return hash.startsWith('/') ? hash : `/${hash}`;
}

export function navigate(path: Route) {
  const target = path.startsWith('/') ? path : `/${path}`;
  window.location.hash = target;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function useRouter() {
  const [path, setPath] = useState<string>(getPathFromHash());

  useEffect(() => {
    const handleHashChange = () => {
      setPath(getPathFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return {
    path,
    currentRoute: path,
    navigate: (route: Route) => navigate(route),
  };
}
