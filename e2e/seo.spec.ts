import { expect, test } from '@playwright/test';

import { acceptTermsBeforeLoad } from './helpers';

const SITE = 'https://app.declaraturenta.com';

const PUBLIC = [
  {
    path: '/',
    title: 'Declara tu renta · Tu Formulario 210, explicado casilla por casilla',
    image: 'og-landing',
  },
  { path: '/terminos', title: 'Términos de uso · Declara tu renta', image: 'og-terminos' },
  { path: '/privacidad', title: 'Política de privacidad · Declara tu renta', image: 'og-privacidad' },
];

test.describe('first response, as link previews see it (no JavaScript)', () => {
  for (const page of PUBLIC) {
    test(`${page.path} has its own tags`, async ({ request }) => {
      const html = await (await request.get(page.path)).text();
      expect(html).toContain(`<title>${page.title}</title>`);
      expect(html).toContain('<meta name="robots" content="index, follow" />');
      expect(html).toContain(`<link rel="canonical" href="${SITE}${page.path}" />`);
      expect(html).toContain(`<meta property="og:image" content="${SITE}/og/${page.image}.png" />`);
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
    });
  }

  test('app routes are not indexed', async ({ request }) => {
    for (const path of ['/inicio', '/ingresos', '/formulario-210', '/no-existe']) {
      const html = await (await request.get(path)).text();
      expect(html, path).toContain('<meta name="robots" content="noindex, nofollow" />');
      expect(html, path).not.toContain('rel="canonical"');
    }
  });

  test('robots.txt, sitemap and images are served', async ({ request }) => {
    expect(await (await request.get('/robots.txt')).text()).toContain(`Sitemap: ${SITE}/sitemap.xml`);
    expect((await (await request.get('/sitemap.xml')).text()).match(/<loc>/g)).toHaveLength(3);
    for (const image of ['og-landing', 'og-terminos', 'og-privacidad', 'og-app']) {
      const response = await request.get(`/og/${image}.png`);
      expect(response.headers()['content-type']).toBe('image/png');
    }
  });
});

test('the title follows the navigation inside the app', async ({ page }) => {
  await acceptTermsBeforeLoad(page);
  await page.goto('/');
  await expect(page).toHaveTitle(PUBLIC[0].title);

  await page.goto('/ingresos');
  await expect(page).toHaveTitle('Ingresos · Declara tu renta');
  await page.getByRole('link', { name: 'Patrimonio' }).click();
  await expect(page).toHaveTitle('Patrimonio · Declara tu renta');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});
