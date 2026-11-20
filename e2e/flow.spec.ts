import { expect, test } from '@playwright/test';

import { FICTIONAL_EXOGENOUS } from './helpers';

test('from the exogenous report to the draft of the 210', async ({ page }) => {
  await page.goto('/inicio');

  const terms = page.getByRole('dialog', { name: 'Antes de empezar' });
  await expect(terms.getByRole('button', { name: 'Empezar' })).toBeDisabled();
  await terms.getByText('Leí y acepto').click();
  await terms.getByRole('button', { name: 'Empezar' }).click();
  await expect(terms).toBeHidden();

  await page.getByRole('button', { name: 'Subir mi exógena' }).click();
  await expect(page).toHaveURL(/\/exogena$/);
  await page.locator('input[type=file]:not([accept*=json])').setInputFiles(FICTIONAL_EXOGENOUS);
  await expect(page.getByText('Empresa Andina S.A.S.').first()).toBeVisible();
  await page.getByRole('button', { name: 'Usar estos datos' }).click();

  await expect(page).toHaveURL(/\/ingresos$/);
  await expect(page.getByLabel('Salarios y pagos laborales')).toHaveValue('180.000.000');
  await page.getByRole('button', { name: 'Guardar y seguir' }).click();

  await expect(page).toHaveURL(/\/patrimonio$/);
  await expect(page.getByText('Banco Cordillera S.A.').first()).toBeVisible();
  await page.getByRole('button', { name: 'Guardar y seguir' }).click();

  await expect(page).toHaveURL(/\/deducciones$/);
  await page.getByRole('button', { name: 'Seguir con otros ajustes' }).click();

  await expect(page).toHaveURL(/\/otros-ajustes$/);
  await page.getByRole('button', { name: 'Ver mi resultado' }).click();

  await expect(page).toHaveURL(/\/resultado$/);
  await expect(page.getByText('Tienes saldo a pagar')).toBeVisible();
  await expect(page.getByText('$ 6.148.000').first()).toBeVisible();
  await expect(page.getByText('Sí tienes que declarar')).toBeVisible();
  await page.getByRole('button', { name: 'Ver borrador del 210' }).click();

  await expect(page).toHaveURL(/\/borrador-210$/);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar PDF' }).first().click();
  expect((await download).suggestedFilename()).toBe('borrador-formulario-210-ag2025.pdf');
});
