import { createInitialState } from './declaration-state';
import type { DeclarationState } from './declaration-state';
import { migrateState } from './migrate-state';

export const STORAGE_KEY = 'declaraturenta:declaration';

/** Reads the saved state, migrated to the current version. Falls back to the initial state. */
export const loadState = (): DeclarationState => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed: unknown = JSON.parse(raw);
    return migrateState(parsed) ?? createInitialState();
  } catch {
    return createInitialState();
  }
};

/** Saves the state. Returns false when storage is unavailable (private mode, quota). */
export const saveState = (state: DeclarationState): boolean => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
};
