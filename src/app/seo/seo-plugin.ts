import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { Plugin, ResolvedConfig } from 'vite';

import { APP_PAGE, PUBLIC_PAGES, renderHead, renderSitemap } from './pages.ts';
import type { PageMeta } from './pages.ts';

const START = '<!-- seo:start -->';
const END = '<!-- seo:end -->';
const PLACEHOLDER = '<!-- seo -->';

const block = (page: PageMeta) => `${START}\n    ${renderHead(page)}\n    ${END}`;

/**
 * Writes one HTML file per public page with its own `<head>`, plus `app.html` for the private
 * routes and `sitemap.xml`, because link previews do not run JavaScript (ADR 0041).
 */
export const seoPages = (): Plugin => {
  let config: ResolvedConfig;
  return {
    name: 'declaraturenta-seo',
    configResolved(resolved) {
      config = resolved;
    },
    // `vite preview` (and the e2e tests) route like Vercel: /terminos → terminos.html, unknown
    // paths → app.html.
    configurePreviewServer(server) {
      const outDir = server.config.build.outDir;
      server.middlewares.use((req, _res, next) => {
        const [path = '/', query] = (req.url ?? '/').split('?');
        if (path !== '/' && !path.includes('.')) {
          const file = existsSync(join(outDir, `${path}.html`)) ? `${path}.html` : `/${APP_PAGE.file}`;
          req.url = query ? `${file}?${query}` : file;
        }
        next();
      });
    },
    transformIndexHtml(html) {
      return html.replace(PLACEHOLDER, block(PUBLIC_PAGES.landing));
    },
    async closeBundle() {
      if (config.command !== 'build' || config.build.ssr) return;
      const outDir = config.build.outDir;
      const index = await readFile(join(outDir, 'index.html'), 'utf8');
      const pattern = new RegExp(`${START}[\\s\\S]*?${END}`);
      if (!pattern.test(index)) throw new Error('seo: index.html has no SEO block');
      for (const page of [PUBLIC_PAGES.terms, PUBLIC_PAGES.privacy, APP_PAGE]) {
        await writeFile(join(outDir, page.file), index.replace(pattern, block(page)));
      }
      await writeFile(join(outDir, 'sitemap.xml'), renderSitemap(new Date().toISOString().slice(0, 10)));
    },
  };
};
