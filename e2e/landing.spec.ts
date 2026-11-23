import { expect, test } from '@playwright/test';

test.describe('landing', () => {
  test('the calculator says when the salary passes the income test', async ({ page }) => {
    await page.goto('/');
    const calculator = page.locator('#debo-declarar');
    const salary = calculator.getByLabel('¿Cuánto recibías al mes por tu trabajo?');

    await salary.fill('5000000');
    await expect(calculator.getByText('Con estas respuestas no tienes que declarar')).toBeVisible();

    await salary.fill('6000000');
    await expect(calculator.getByText('Sí debes declarar')).toBeVisible();
    await expect(calculator.getByText(/pasas el tope de ingresos/)).toBeVisible();
  });

  test('one yes is enough to file', async ({ page }) => {
    await page.goto('/');
    const calculator = page.locator('#debo-declarar');
    // The switch has no accessible name yet (pending accessibility audit), so find it by its row.
    await calculator
      .locator('.toggle-field', { hasText: '¿Eras responsable de IVA?' })
      .locator('.polpo-switch')
      .click();
    await expect(calculator.getByText('Sí debes declarar')).toBeVisible();
  });

  test('links to the legal pages and starts the declaration', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Términos de uso' }).click();
    await expect(page).toHaveURL(/\/terminos$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Términos de uso' })).toBeVisible();

    await page.goto('/');
    await page.locator('#debo-declarar').getByRole('button', { name: 'Preparar mi declaración' }).click();
    await expect(page).toHaveURL(/\/inicio$/);
    await expect(page.getByRole('dialog', { name: 'Antes de empezar' })).toBeVisible();
  });

  test('works on a phone, while the full 210 asks for a computer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#debo-declarar')).toBeVisible();

    await page.goto('/formulario-210');
    await expect(
      page.getByRole('heading', { name: 'El Formulario 210 se usa en un computador' }),
    ).toBeVisible();
  });
});
