import { expect, test } from '@playwright/test';

import { acceptTermsBeforeLoad, importFictionalExogenous } from './helpers';

test('switches between the steps and the Formulario 210, back to the same step (ADR 0056)', async ({
  page,
}) => {
  await acceptTermsBeforeLoad(page);
  await importFictionalExogenous(page);

  await page.goto('/ingresos');
  const switcher = page.getByRole('navigation', { name: 'Cómo llenar tu declaración' });
  await switcher.getByRole('button', { name: 'Formulario 210' }).click();
  await expect(switcher.getByRole('button', { name: 'Pasos' })).not.toHaveAttribute('aria-current');
  await expect(page).toHaveURL(/\/formulario-210$/);

  await page.getByRole('navigation', { name: 'Cómo llenar tu declaración' }).getByText('Pasos').click();
  await expect(page).toHaveURL(/\/ingresos$/);
});
