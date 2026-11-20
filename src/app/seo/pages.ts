/**
 * Metadata of each page for search engines and link previews (ADR 0041). Plain TypeScript without
 * path aliases: the Vite plugin in `vite.config.ts` reads it at build time and the app at runtime.
 */

export const SITE_URL = 'https://app.declaraturenta.com';
export const SITE_NAME = 'Declara tu renta';
/** bg/lienzo, for the browser UI and the installed icon. */
export const THEME_COLOR = '#f7f7fb';

export type PageMeta = {
  /** Route; `null` for the app shell, which serves every private route. */
  path: string | null;
  /** HTML file written in `dist`. */
  file: string;
  title: string;
  description: string;
  /** Open Graph image in `public/og`, 1200 × 630, designed in Figma (section 19). */
  image: string;
  imageAlt: string;
  /** Only the landing and the legal pages go to search engines and the sitemap. */
  indexable: boolean;
};

export const PUBLIC_PAGES = {
  landing: {
    path: '/',
    file: 'index.html',
    title: 'Declara tu renta · Tu Formulario 210, explicado casilla por casilla',
    description:
      'Prepara tu declaración de renta (Formulario 210, año gravable 2025) con preguntas sencillas, tu información exógena y la explicación de cada cifra.',
    image: '/og/og-landing.png',
    imageAlt:
      'Declara tu renta: tu declaración de renta, explicada casilla por casilla, con una vista del resultado.',
    indexable: true,
  },
  terms: {
    path: '/terminos',
    file: 'terminos.html',
    title: 'Términos de uso · Declara tu renta',
    description:
      'Qué hace Declara tu renta, qué no hace y lo que te corresponde al usarla para preparar tu Formulario 210.',
    image: '/og/og-terminos.png',
    imageAlt: 'Términos de uso de Declara tu renta.',
    indexable: true,
  },
  privacy: {
    path: '/privacidad',
    file: 'privacidad.html',
    title: 'Política de privacidad · Declara tu renta',
    description:
      'Tus datos se quedan en tu navegador. Qué tratamos, para qué y cuáles son tus derechos según la Ley 1581 de 2012.',
    image: '/og/og-privacidad.png',
    imageAlt: 'Política de privacidad de Declara tu renta.',
    indexable: true,
  },
} as const satisfies Record<string, PageMeta>;

export const APP_PAGE = {
  path: null,
  file: 'app.html',
  title: 'Declara tu renta · Tu Formulario 210 paso a paso',
  description:
    'Ingresos, patrimonio, deducciones y resultado de tu Formulario 210, con la explicación de cada cifra.',
  image: '/og/og-app.png',
  imageAlt: 'Declara tu renta: prepara tu Formulario 210 paso a paso.',
  indexable: false,
} as const satisfies PageMeta;

/** schema.org data for the landing. No ratings, reviews or endorsements. */
export const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  description: PUBLIC_PAGES.landing.description,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  browserRequirements: 'Requiere un navegador moderno en un computador.',
  inLanguage: 'es-CO',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'COP' },
  areaServed: { '@type': 'Country', name: 'Colombia' },
} as const;

const escape = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/** `<head>` tags of a page: title, description, robots, canonical, Open Graph and X card. */
export const renderHead = (page: PageMeta): string => {
  const url = page.path === null ? null : `${SITE_URL}${page.path}`;
  const image = `${SITE_URL}${page.image}`;
  const tags = [
    `<title>${escape(page.title)}</title>`,
    `<meta name="description" content="${escape(page.description)}" />`,
    `<meta name="robots" content="${page.indexable ? 'index, follow' : 'noindex, nofollow'}" />`,
    url && `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="es_CO" />`,
    `<meta property="og:title" content="${escape(page.title)}" />`,
    `<meta property="og:description" content="${escape(page.description)}" />`,
    url && `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escape(page.imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(page.title)}" />`,
    `<meta name="twitter:description" content="${escape(page.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="twitter:image:alt" content="${escape(page.imageAlt)}" />`,
    page.path === '/' &&
      `<script type="application/ld+json">${JSON.stringify(STRUCTURED_DATA).replaceAll('<', '\\u003c')}</script>`,
  ];
  return tags.filter(Boolean).join('\n    ');
};

/** sitemap.xml with the public pages (all of them are indexable). */
export const renderSitemap = (lastModified: string): string => {
  const urls = Object.values(PUBLIC_PAGES).map(
    page => `  <url><loc>${SITE_URL}${page.path}</loc><lastmod>${lastModified}</lastmod></url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
};
