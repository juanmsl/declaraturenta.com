import { fileURLToPath } from 'node:url';

import type { Page } from '@playwright/test';

import { LEGAL_UPDATED_AT } from '../src/features/legal/legal-content';

/**
 * Fictional DIAN exogenous report with the layout of the real .xlsx, built from
 * `src/mocks/exogenous-sheet-fixture.ts`. Every person, entity and value in it is invented.
 */
export const FICTIONAL_EXOGENOUS = fileURLToPath(
  new URL('./fixtures/exogena-ficticia.xlsx', import.meta.url),
);

export const STORAGE_KEY_2025 = 'declaraturenta:declaration:2025';

/** Skips the «Antes de empezar» dialog, as if the terms were already accepted. */
export const acceptTermsBeforeLoad = async (page: Page) => {
  await page.addInitScript(version => {
    window.localStorage.setItem('declaraturenta:terms-accepted', JSON.stringify({ version }));
  }, LEGAL_UPDATED_AT);
};

/** From Inicio, uploads the fictional exogenous report and confirms it. */
export const importFictionalExogenous = async (page: Page) => {
  await page.goto('/exogena');
  // The «Copia» menu has its own hidden file input (.json); this is the .xlsx one.
  await page.locator('input[type=file]:not([accept*=json])').setInputFiles(FICTIONAL_EXOGENOUS);
  await page.getByRole('button', { name: 'Usar estos datos' }).click();
  await page.waitForURL('**/patrimonio');
};
