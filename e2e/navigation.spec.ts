import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { acceptTermsBeforeLoad } from './helpers';

const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

test('a new page starts at the top and «Atrás» goes back to where you were', async ({ page }) => {
  await page.goto('/');
  await page.locator('#preguntas').scrollIntoViewIfNeeded();
  const before = await scrollY(page);
  expect(before).toBeGreaterThan(1000);

  await page.getByRole('contentinfo').getByRole('link', { name: 'Términos de uso' }).click();
  await expect(page).toHaveURL(/\/terminos$/);
  // Instant, not a smooth scroll from the previous position.
  expect(await scrollY(page)).toBe(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => scrollY(page)).toBeGreaterThan(before - 50);
});

test('section links on the landing scroll to their section', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Secciones' })
    .getByRole('link', { name: 'Preguntas frecuentes' })
    .click();
  await expect(page.getByRole('heading', { name: 'Preguntas frecuentes' })).toBeInViewport();
  await expect(page).toHaveURL(/\/$/);
});

test('steps of the flow slide forward and back; other pages fade in', async ({ page }) => {
  await acceptTermsBeforeLoad(page);
  await page.goto('/patrimonio');
  const content = page.locator('main > div').first();

  await page.getByRole('link', { name: 'Ingresos' }).click();
  await expect(content).toHaveClass(/page-enter-forward/);
  await page.getByRole('link', { name: 'Patrimonio' }).click();
  await expect(content).toHaveClass(/page-enter-back/);
  await page
    .getByRole('link', { name: /Inicio|Declara tu renta/ })
    .first()
    .click();
  await expect(page.locator('main > div').first()).toHaveClass(/page-enter-fade/);
});

test('landing sections enter when they scroll into view', async ({ page }) => {
  await page.goto('/');
  const faq = page.locator('#preguntas');
  await expect(faq).toHaveAttribute('data-reveal', 'out');
  await faq.scrollIntoViewIfNeeded();
  await expect(faq).toHaveAttribute('data-reveal', 'in');
});

test.describe('with reduced motion', () => {
  test.use({ colorScheme: 'light', reducedMotion: 'reduce' });

  test('landing content is visible without animating', async ({ page }) => {
    await page.goto('/');
    const item = page.locator('#preguntas .reveal-item').first();
    await expect(item).toHaveCSS('opacity', '1');
    await expect(item).toHaveCSS('transition-duration', '0s');
  });
});
