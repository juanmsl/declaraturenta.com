import { expect, test } from '@playwright/test';

import { acceptTermsBeforeLoad, importFictionalExogenous, STORAGE_KEY_2025 } from './helpers';

test.beforeEach(async ({ page }) => {
  await acceptTermsBeforeLoad(page);
});

test('downloads a copy, deletes the open year and opens the copy again', async ({ page }, testInfo) => {
  await importFictionalExogenous(page);
  await expect(page.getByText('15 de septiembre de 2026').first()).toBeVisible();

  // Another year saved in this browser must survive «Borrar mis datos».
  await page.evaluate(() => {
    window.localStorage.setItem('declaraturenta:declaration:2024', '{"kept":true}');
  });

  await page.getByRole('button', { name: 'Copia' }).click();
  const download = page.waitForEvent('download');
  // Polpo's ripple covers the menu options, so the click is forced.
  await page.getByText('Descargar copia').click({ force: true });
  const copyPath = testInfo.outputPath('copia.json');
  await (await download).saveAs(copyPath);

  await page.getByRole('button', { name: 'Copia' }).click();
  await page.getByText('Borrar mis datos').click({ force: true });
  const confirm = page.getByRole('dialog', { name: '¿Borrar tus datos de este navegador?' });
  await confirm.getByRole('button', { name: 'Borrar mis datos' }).click();

  await expect(page).toHaveURL(/\/inicio$/);
  await expect(page.getByText('Aún sin calcular').first()).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem('declaraturenta:declaration:2024'))).toBe(
    '{"kept":true}',
  );
  expect(
    await page.evaluate(() => window.localStorage.getItem('declaraturenta:terms-accepted')),
  ).not.toBeNull();

  await page.locator('input[type=file][accept*=json]').setInputFiles(copyPath);
  const replace = page.getByRole('dialog', { name: '¿Reemplazar tus datos con la copia?' });
  await replace.getByRole('button', { name: 'Reemplazar' }).click();
  await expect(page.getByText('15 de septiembre de 2026').first()).toBeVisible();
  expect(await page.evaluate(key => window.localStorage.getItem(key), STORAGE_KEY_2025)).toContain(
    'Empresa Andina',
  );
});
