import { LEGAL_UPDATED_AT } from '@/features/legal/legal-content';

/** Key of the acceptance in localStorage; it is the same for every taxable year. */
export const TERMS_KEY = 'declaraturenta:terms-accepted';

/** True when the person accepted the current version of the terms in this browser. */
export const hasAcceptedTerms = (): boolean => {
  try {
    const saved = window.localStorage.getItem(TERMS_KEY);
    if (!saved) return false;
    const value = JSON.parse(saved) as { version?: unknown };
    return value.version === LEGAL_UPDATED_AT;
  } catch {
    return false;
  }
};

/** Records the acceptance with the version of the terms and the moment. */
export const acceptTerms = (at = new Date()): void => {
  try {
    window.localStorage.setItem(
      TERMS_KEY,
      JSON.stringify({ version: LEGAL_UPDATED_AT, at: at.toISOString() }),
    );
  } catch {
    // Without storage the dialog will show again next time; nothing else to do.
  }
};
