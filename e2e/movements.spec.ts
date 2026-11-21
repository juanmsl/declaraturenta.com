import { expect, test } from '@playwright/test';

import { acceptTermsBeforeLoad, FICTIONAL_EXOGENOUS } from './helpers';

test('the year movements are a list with the amount edited in the row', async ({ page }) => {
  await acceptTermsBeforeLoad(page);
  await page.goto('/exogena');
  await page.locator('input[type=file][accept=".xlsx"]').setInputFiles(FICTIONAL_EXOGENOUS);

  const movements = page.getByRole('region', { name: 'Tus movimientos en 2025' });
  await expect(movements.getByRole('listitem')).toHaveCount(3);
  await expect(movements.getByText('$ 69.718.600 (1.400 UVT)', { exact: false })).toBeVisible();

  const row = movements.getByRole('listitem').filter({ hasText: 'Compras con tarjeta de crédito' });
  const amount = row.getByLabel('Compras con tarjeta de crédito');
  const reported = await amount.inputValue();
  await expect(row.getByText('Desde exógena')).toBeVisible();

  await amount.fill('70000000');
  await amount.blur();
  await expect(amount).toHaveValue('70.000.000');
  await expect(row.getByText('Desde exógena')).toBeHidden();

  await amount.fill(reported.replaceAll('.', ''));
  await amount.blur();
  await expect(row.getByText('Desde exógena')).toBeVisible();
});
