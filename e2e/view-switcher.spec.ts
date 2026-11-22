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
  // The 210 bar also has the logo, «Mis datos» and «Ayuda».
  await expect(page.getByRole('banner').getByRole('link', { name: 'Declara tu renta' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mis datos' })).toBeVisible();
  await page.getByRole('button', { name: 'Ayuda' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByRole('navigation', { name: 'Cómo llenar tu declaración' }).getByText('Pasos').click();
  await expect(page).toHaveURL(/\/ingresos$/);
});
