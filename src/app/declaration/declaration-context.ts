import { createContext, use } from 'react';
import type { Dispatch } from 'react';

import type { DeclarationResult } from '@/domain/declaration';

import type { DeclarationAction, DeclarationState } from './declaration-state';

export type DeclarationContextValue = {
  state: DeclarationState;
  dispatch: Dispatch<DeclarationAction>;
  /** Full calculation, with every deduction. */
  result: DeclarationResult;
  /** Live estimate: excludes deductions until the user reaches that step. */
  estimate: DeclarationResult;
  /** Whether `estimate` already includes deductions. */
  estimateIncludesDeductions: boolean;
};

export const DeclarationContext = createContext<DeclarationContextValue | null>(null);

export const useDeclaration = (): DeclarationContextValue => {
  const value = use(DeclarationContext);
  if (!value) throw new Error('useDeclaration must be used inside <DeclarationProvider>');
  return value;
};
