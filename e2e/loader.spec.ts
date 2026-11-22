import { expect, test } from '@playwright/test';

import { acceptTermsBeforeLoad } from './helpers';

test('shows the loader until the app renders, then removes it (ADR 0053)', async ({ page }) => {
  await acceptTermsBeforeLoad(page);
  // Hold the app's JavaScript so the initial HTML stays on screen.
  let release: () => void = () => undefined;
  const held = new Promise<void>(resolve => {
    release = resolve;
  });
  await page.route(/\/assets\/.*\.js$/, async route => {
    await held;
    await route.continue();
  });
  await page.goto('/inicio', { waitUntil: 'commit' });
  const loader = page.getByRole('status', { name: 'Cargando Declara tu renta' });
  await expect(loader).toBeVisible();

  release();
  await expect(loader).toBeHidden();
  await expect(page.getByRole('main')).toBeVisible();
});
