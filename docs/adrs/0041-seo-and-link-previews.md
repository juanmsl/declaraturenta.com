# 0041. SEO and link previews

- Status: Accepted
- Date: 2026-11-20

## Context

The landing page and the legal pages should be found in search engines and look good when shared
(WhatsApp, Facebook, LinkedIn, X). The app is a single page app, and link previews do not run
JavaScript: they only read the HTML of the first response.

## Decision

All choices below are the owner's.

- **What is indexed:** the landing (`/`), `/terminos` and `/privacidad`. Every route of the app
  (`/inicio`, the steps, `/formulario-210`, unknown paths) has `noindex, nofollow` and no canonical:
  it starts empty and keeps personal data in the browser.
- **One HTML file per public page, written at build time.** `src/app/seo/pages.ts` holds the title,
  description and image of each page. The Vite plugin `src/app/seo/seo-plugin.ts` puts the landing
  head into `index.html` and writes `terminos.html`, `privacidad.html`, `app.html` (the private shell)
  and `sitemap.xml`. Vercel serves `/terminos` from `terminos.html` (`cleanUrls`) and rewrites every
  other path to `app.html`. No server, no new dependencies.
- **While navigating** inside the app, `usePageMeta` keeps the title, description, robots and
  canonical in sync (e.g. «Ingresos · Declara tu renta»).
- **Tags:** title, description, robots, canonical, Open Graph (`es_CO`, 1200 × 630 PNG with alt
  text) and the X card `summary_large_image`.
- **Images, designed in Figma** (section «19 · SEO y redes sociales», page «Flujo · AG 2025») with
  the design system and exported at their exact size to `public/`:
  - `og/og-landing.png`, `og/og-terminos.png`, `og/og-privacidad.png`, `og/og-app.png`.
  - `apple-touch-icon.png` (180), `icons/icon-192.png`, `icons/icon-512.png` (also maskable): the
    isotipo on bg/lienzo.
- **Extras:** `robots.txt` (allows everything, points to the sitemap), `site.webmanifest`
  (`theme-color` #f7f7fb) and schema.org `WebApplication` data on the landing (free, in Spanish,
  for Colombia; no ratings, reviews or endorsements).

## Consequences

- A new public page needs an entry in `pages.ts`, a file in the plugin list and an OG image.
- Changing a title or description means changing `pages.ts`; the OG images are changed in Figma and
  exported again.
- The structured data says the service is free. It must change if the business model adds a price.
