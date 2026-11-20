import { DEFAULT_TAX_YEAR, findTaxYear, getTaxYear } from '@/domain/tax-years';

import { createInitialState } from './declaration-state';
import type { DeclarationState } from './declaration-state';
import { migrateState } from './migrate-state';

/** Before ADR 0034 there was a single return, always AG 2025. */
export const LEGACY_STORAGE_KEY = 'declaraturenta:declaration';
const LEGACY_YEAR = 2025;
export const SELECTED_YEAR_KEY = 'declaraturenta:tax-year';

/** Each taxable year keeps its own return. */
export const storageKey = (year: number) => `${LEGACY_STORAGE_KEY}:${String(year)}`;

const read = (key: string): unknown => {
  const raw = window.localStorage.getItem(key);
  return raw === null ? null : (JSON.parse(raw) as unknown);
};

/** Reads the saved return of a year, migrated to the current version. Falls back to a new one. */
export const loadState = (year: number = DEFAULT_TAX_YEAR): DeclarationState => {
  const config = getTaxYear(year);
  try {
    const saved =
      read(storageKey(config.year)) ?? (config.year === LEGACY_YEAR ? read(LEGACY_STORAGE_KEY) : null);
    const state = saved === null ? null : migrateState(saved);
    return state?.taxYear === config.year ? state : createInitialState(config);
  } catch {
    return createInitialState(config);
  }
};

/** Saves the return under its year. Returns false when storage is unavailable (private mode, quota). */
export const saveState = (state: DeclarationState): boolean => {
  try {
    window.localStorage.setItem(storageKey(state.taxYear), JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
};

/** The year the person was working on, if it is still configured. */
export const loadSelectedYear = (): number => {
  try {
    const saved = Number(window.localStorage.getItem(SELECTED_YEAR_KEY));
    return findTaxYear(saved)?.year ?? DEFAULT_TAX_YEAR;
  } catch {
    return DEFAULT_TAX_YEAR;
  }
};

export const saveSelectedYear = (year: number): void => {
  try {
    window.localStorage.setItem(SELECTED_YEAR_KEY, String(year));
  } catch {
    // Storage unavailable: the choice lasts until the page is closed.
  }
};
