import { useEffect, useRef } from 'react';

export function useScrollReveal() {
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const revealElements = (root: ParentNode = document) => {
      const elements = [
        ...(root instanceof HTMLElement && root.matches('.reveal:not(.is-visible)') ? [root] : []),
        ...Array.from(root.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)')),
      ];
      if (!('IntersectionObserver' in window)) {
        elements.forEach((element) => element.classList.add('is-visible'));
        return;
      }
      elements.forEach((element) => observer.current?.observe(element));
    };

    if (!('IntersectionObserver' in window)) {
      revealElements();
      return;
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            intersectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    observer.current = intersectionObserver;
    revealElements();

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) revealElements(node);
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      intersectionObserver.disconnect();
      observer.current = null;
    };
  }, []);
}
