import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { acceptTermsBeforeLoad, importFictionalExogenous } from './helpers';

const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

test.beforeEach(async ({ page }) => {
  await acceptTermsBeforeLoad(page);
  await importFictionalExogenous(page);
});

test('opening and closing a box keeps the scroll where it is', async ({ page }) => {
  await page.goto('/formulario-210');
  const box = page.getByRole('button', { name: /^Casilla 38,/ });
  await box.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    window.scrollBy(0, 120);
  });
  const before = await scrollY(page);
  expect(before).toBeGreaterThan(500);

  // A DOM click: Playwright's own click would scroll the button into view first.
  await box.evaluate(element => {
    (element as HTMLButtonElement).click();
  });
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveURL(/casilla=38/);
  expect(await scrollY(page)).toBe(before);

  await page.getByLabel('Cerrar').evaluate(element => {
    (element as HTMLButtonElement).click();
  });
  await expect(page).not.toHaveURL(/casilla=/);
  expect(await scrollY(page)).toBe(before);
});

test('a link to a box scrolls to it on arrival', async ({ page }) => {
  await page.goto('/formulario-210?casilla=132');
  await expect(page.getByRole('dialog')).toBeVisible();
  // The open panel locks the page scroll, so check the box position directly.
  await expect
    .poll(() =>
      page.getByRole('button', { name: /^Casilla 132,/ }).evaluate(element => {
        const { top, bottom } = element.getBoundingClientRect();
        return top >= 0 && bottom <= window.innerHeight;
      }),
    )
    .toBe(true);
});
