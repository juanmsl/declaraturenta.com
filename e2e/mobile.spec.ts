import { expect, test } from '@playwright/test';

import { acceptTermsBeforeLoad, importFictionalExogenous } from './helpers';

/** Phones and tablets get the steps in one column (ADR 0060). */
test.describe('phone layout', () => {
  test.beforeEach(async ({ page }) => {
    await acceptTermsBeforeLoad(page);
    await importFictionalExogenous(page);
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('moves between the steps from the top bar sheet', async ({ page }) => {
    await page.goto('/ingresos');
    const bar = page.getByRole('banner');
    await bar.getByRole('button', { name: /Paso 3 de 7 · Ingresos/ }).click();
    const sheet = page.getByRole('dialog', { name: 'Tu declaración' });
    await sheet.getByRole('link', { name: /Deducciones/ }).click();
    await expect(page).toHaveURL(/\/deducciones$/);
    await expect(bar.getByRole('button', { name: /Paso 4 de 7 · Deducciones/ })).toBeVisible();
    // Nothing is wider than the screen once the page transition ends.
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(390);
  });

  test('keeps the estimate in a bar and lets the person move it', async ({ page }) => {
    await page.goto('/ingresos');
    await page.getByRole('button', { name: /Ver detalle/ }).click();
    const sheet = page.getByRole('dialog', { name: 'Así va tu declaración' });
    await expect(sheet.getByText('Saldo a pagar estimado')).toBeVisible();
    await sheet.getByText('Al final de cada paso').click();
    await expect(page.getByRole('button', { name: /Ver detalle/ })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Así va tu declaración' })).toBeVisible();

    // The choice stays after a reload.
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Así va tu declaración' })).toBeVisible();
  });

  test('fills the Formulario 210 by sections (ADR 0061)', async ({ page }) => {
    await page.goto('/patrimonio');
    await page
      .getByRole('navigation', { name: 'Cómo llenar tu declaración' })
      .getByRole('button', { name: 'Formulario 210' })
      .click();
    await expect(page).toHaveURL(/\/formulario-210$/);
    await expect(page.getByRole('heading', { level: 1, name: /Formulario 210/ })).toBeVisible();

    await page.getByRole('button', { name: /^Cédula general/ }).click();
    await expect(page.getByLabel(/^Casilla 32,/)).toBeVisible();
    await page.getByRole('button', { name: 'Honorarios y servicios' }).click();
    await expect(page.getByLabel(/^Casilla 43,/)).toBeVisible();
    await expect(page.getByLabel(/^Casilla 32,/)).toHaveCount(0);

    await page.getByLabel('Ir a la casilla').fill('31');
    await expect(page.getByLabel(/^Casilla 31,/)).toBeInViewport();

    await page.getByRole('button', { name: /^Casilla 29,/ }).click();
    await expect(page.getByRole('dialog').getByText('Casilla 29', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('opens «Mis datos» and help from the menu', async ({ page }) => {
    await page.goto('/inicio');
    await page.getByRole('button', { name: 'Menú' }).click();
    const menu = page.getByRole('dialog', { name: 'Menú' });
    await expect(menu.getByRole('button', { name: /Descargar datos/ })).toBeVisible();
    await menu.getByRole('button', { name: /Reiniciar formulario/ }).click();
    await expect(page.getByRole('dialog', { name: '¿Reiniciar el formulario?' })).toBeVisible();
  });
});
