import { createInitialState, STATE_VERSION } from './declaration-state';
import type { DeclarationState } from './declaration-state';

export const STORAGE_KEY = 'declaraturenta:declaration';

const isState = (value: unknown): value is DeclarationState =>
  typeof value === 'object' &&
  value !== null &&
  'version' in value &&
  value.version === STATE_VERSION &&
  'data' in value;

/** Reads the saved state. Falls back to the initial state if missing, unreadable or outdated. */
export const loadState = (): DeclarationState => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed: unknown = JSON.parse(raw);
    return isState(parsed) ? parsed : createInitialState();
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
