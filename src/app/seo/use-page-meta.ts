import { useEffect } from 'react';

import { APP_PAGE, SITE_NAME, SITE_URL } from './pages';
import type { PageMeta } from './pages';

const setMeta = (name: string, content: string) => {
  document.querySelector(`meta[name="${name}"]`)?.setAttribute('content', content);
};

/**
 * Keeps the title, description, robots and canonical in sync while navigating inside the app. The
 * first load already has them in the HTML of each route (ADR 0041).
 */
export const usePageMeta = (page: PageMeta, title: string = page.title) => {
  useEffect(() => {
    document.title = title;
    setMeta('description', page.description);
    setMeta('robots', page.indexable ? 'index, follow' : 'noindex, nofollow');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (page.path === null) canonical?.remove();
    else if (canonical) canonical.setAttribute('href', `${SITE_URL}${page.path}`);
    else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = `${SITE_URL}${page.path}`;
      document.head.append(link);
    }
  }, [page, title]);
};

/** Title of a private screen, e.g. "Ingresos · Declara tu renta". */
export const useAppPageMeta = (screen: string) => {
  usePageMeta(APP_PAGE, `${screen} · ${SITE_NAME}`);
};
