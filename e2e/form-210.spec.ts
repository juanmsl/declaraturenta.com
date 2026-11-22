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

test('a box filled in a step is edited in its panel on a copy, and saved to the step', async ({ page }) => {
  await page.goto('/formulario-210?casilla=112');
  const panel = page.getByRole('dialog');
  await expect(panel.getByText('Tuve ganancias ocasionales')).toBeVisible();

  await panel
    .locator('.toggle-field', { hasText: 'Tuve ganancias ocasionales' })
    .locator('.polpo-switch')
    .click();
  await panel.getByRole('button', { name: 'Agregar ganancia ocasional' }).click();
  await panel.getByLabel('Valor recibido').fill('10000000');
  // The total of the box follows the copy before saving.
  await expect(panel.getByText('$ 10.000.000').first()).toBeVisible();
  // Nothing is applied yet: occasional gains are still off in the return, so the 210 hides them.
  await expect(page.locator('[aria-label^="Casilla 112,"]')).toHaveCount(0);

  await panel.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(panel).toBeHidden();
  await expect(page.getByRole('button', { name: /^Casilla 112,/ })).toContainText('$ 10.000.000');

  await page.goto('/ingresos');
  await expect(page.getByLabel('Valor recibido')).toHaveValue('10.000.000');
});

test('closing the panel discards what was typed', async ({ page }) => {
  await page.goto('/formulario-210?casilla=141');
  const panel = page.getByRole('dialog');
  await panel.getByLabel('Aporte voluntario (opcional)').fill('500000');
  await panel.getByRole('button', { name: 'Cerrar', exact: true }).last().click();
  await expect(panel).toBeHidden();
  await expect(page.getByRole('button', { name: /^Casilla 141,/ })).toContainText('$ 0');
});

test('boxes 60 and 75–77 add up their own concepts in their panel (ADR 0052)', async ({ page }) => {
  await page.goto('/ingresos');
  await expect(page.getByText('Tengo costos, devoluciones o aportes en estas rentas')).toHaveCount(0);

  await page.goto('/formulario-210?casilla=77');
  const panel = page.getByRole('dialog');
  for (const [label, amount] of [
    ['Arriendo del local', '300000'],
    ['Servicios públicos', '50000'],
  ] as const) {
    await panel.getByRole('button', { name: 'Agregar concepto' }).click();
    await panel.getByLabel('Concepto', { exact: true }).fill(label);
    await panel.getByLabel('Valor', { exact: true }).fill(amount);
    await panel.getByRole('button', { name: 'Listo' }).click();
  }
  await expect(panel.getByText('2 conceptos sumados')).toBeVisible();
  await panel.getByRole('button', { name: 'Guardar cambios' }).click();

  await expect(page.getByRole('button', { name: /^Casilla 77,/ })).toContainText('$ 350.000');
  await expect(page.getByRole('button', { name: /^Casilla 60,/ })).toContainText('$ 0');
  await expect(page.getByRole('button', { name: /^Casilla 75,/ })).toContainText('$ 0');
});

test('losses and boxes 95 and 96 add up their own concepts in their panel (ADR 0055)', async ({ page }) => {
  await page.goto('/otros-ajustes');
  await expect(page.getByText('Tengo pérdidas fiscales de años anteriores')).toHaveCount(0);
  await expect(page.getByText('Debo sumar rentas gravables')).toHaveCount(0);

  await page.goto('/formulario-210?casilla=96');
  const panel = page.getByRole('dialog');
  await panel.getByRole('button', { name: 'Agregar concepto' }).click();
  await panel.getByLabel('Concepto', { exact: true }).fill('Activo omitido');
  await panel.getByLabel('Valor', { exact: true }).fill('2000000');
  await panel.getByRole('button', { name: 'Listo' }).click();
  await panel.getByRole('button', { name: 'Guardar cambios' }).click();

  await expect(page.getByRole('button', { name: /^Casilla 96,/ })).toContainText('$ 2.000.000');
});
