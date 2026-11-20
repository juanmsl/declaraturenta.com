import { APP_PAGE, PUBLIC_PAGES, renderHead, renderSitemap, SITE_URL } from './pages';

describe('renderHead', () => {
  it('gives public pages their canonical, image and index robots', () => {
    const head = renderHead(PUBLIC_PAGES.terms);
    expect(head).toContain(`<link rel="canonical" href="${SITE_URL}/terminos" />`);
    expect(head).toContain(`content="${SITE_URL}/og/og-terminos.png"`);
    expect(head).toContain('content="index, follow"');
    expect(head).toContain('summary_large_image');
    expect(head).not.toContain('ld+json');
  });

  it('keeps the app shell out of search engines, without canonical', () => {
    const head = renderHead(APP_PAGE);
    expect(head).toContain('content="noindex, nofollow"');
    expect(head).not.toContain('canonical');
    expect(head).not.toContain('og:url');
  });

  it('adds structured data only to the landing and escapes attributes', () => {
    const head = renderHead({ ...PUBLIC_PAGES.landing, title: 'A "B" <C>' });
    expect(head).toContain('application/ld+json');
    expect(head).toContain('<title>A &quot;B&quot; &lt;C&gt;</title>');
  });
});

describe('renderSitemap', () => {
  it('lists the three public pages', () => {
    const xml = renderSitemap('2026-11-20');
    expect(xml.match(/<loc>/g)).toHaveLength(3);
    expect(xml).toContain(`<loc>${SITE_URL}/privacidad</loc>`);
  });
});
