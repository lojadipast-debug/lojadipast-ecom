import { useEffect, useRef } from 'react';

/**
 * Adds the `is-visible` class to `.reveal` elements when they enter the viewport.
 * Lightweight, no deps. Pairs with the `.reveal` CSS utility.
 */
export function useScrollReveal() {
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)'));

    if (!('IntersectionObserver' in window) || els.length === 0) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    els.forEach((el) => obs.observe(el));
    observer.current = obs;

    return () => obs.disconnect();
  }, []);
}
