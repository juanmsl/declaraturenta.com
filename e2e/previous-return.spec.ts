import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

import { acceptTermsBeforeLoad } from './helpers';

/** Fictional Formulario 210 (AG 2024) with the layout of the DIAN PDF. Every value is invented. */
const FICTIONAL_RETURN = fileURLToPath(new URL('./fixtures/declaracion-ficticia-2024.pdf', import.meta.url));

test.beforeEach(async ({ page }) => {
  await acceptTermsBeforeLoad(page);
});

test("reads last year's return and takes its values to this year's boxes", async ({ page }) => {
  await page.goto('/exogena');
  const card = page.locator('section[aria-labelledby="previous-return-title"]');
  await card.locator('input[type=file][accept=".pdf"]').setInputFiles(FICTIONAL_RETURN);

  await expect(card.getByLabel('Impuesto neto de renta (casilla 126)')).toHaveValue('7.500.000');
  await expect(card.getByLabel('Anticipo renta para el año gravable siguiente (casilla 133)')).toHaveValue(
    '2.100.000',
  );
  await expect(card.getByLabel('Total saldo a favor (casilla 137)')).toHaveValue('1.200.000');
  await expect(card.getByLabel('Total patrimonio líquido (casilla 31)')).toHaveValue('195.000.000');
  // The values are a list, in the order 31, 126, 133, 137 (ADR 0050).
  await expect(card.getByRole('listitem')).toHaveCount(4);
  await expect(card.getByRole('listitem').first()).toContainText('Total patrimonio líquido (casilla 31)');
  await expect(card.getByText('Desde tu declaración')).toHaveCount(4);

  // The refund switch starts at «No»: the balance in favor goes to box 131.
  await page.goto('/formulario-210');
  await expect(page.getByRole('button', { name: /^Casilla 130,/ })).toContainText('$ 2.100.000');
  await expect(page.getByRole('button', { name: /^Casilla 131,/ })).toContainText('$ 1.200.000');

  await page.goto('/exogena');
  const refund = card.getByRole('group', { name: /devolviera o compensara/ }).getByRole('checkbox');
  await refund.check({ force: true });
  await expect(card.getByText('Ya lo usaste, así que no se lleva a tu casilla 131')).toBeVisible();
  await page.goto('/formulario-210');
  await expect(page.getByRole('button', { name: /^Casilla 131,/ })).toContainText('$ 0');
});

test('rejects a PDF that is not a 210 and lets the values be typed by hand', async ({ page }) => {
  await page.goto('/exogena');
  const card = page.locator('section[aria-labelledby="previous-return-title"]');
  await card.locator('input[type=file][accept=".pdf"]').setInputFiles({
    name: 'otro.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n%%EOF'),
  });
  await expect(card.getByText(/No pudimos/)).toBeVisible();

  await card.getByRole('button', { name: 'No tengo el PDF: escribir los valores' }).click();
  await card.getByLabel('Anticipo renta para el año gravable siguiente (casilla 133)').fill('900000');
  await page.goto('/formulario-210');
  await expect(page.getByRole('button', { name: /^Casilla 130,/ })).toContainText('$ 900.000');
});
