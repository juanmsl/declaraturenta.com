import type { Dispatch } from 'react';

import { computeDeclaration } from '@/domain/declaration';
import { getTaxYear } from '@/domain/tax-years';

import type { DeclarationContextValue } from './declaration-context';
import { effectiveData } from './declaration-state';
import type { DeclarationAction, DeclarationState } from './declaration-state';

/** What `useDeclaration` gives for a state: the full result and the live estimate. */
export const buildContextValue = (
  state: DeclarationState,
  dispatch: Dispatch<DeclarationAction>,
): DeclarationContextValue => {
  const taxYear = getTaxYear(state.taxYear);
  const includeDeductions = state.visitedSteps.includes('deductions');
  const data = effectiveData(state);
  const options = { taxYear, filingDeadline: state.taxpayer.filingDeadline };
  return {
    state,
    dispatch,
    result: computeDeclaration(data, options),
    estimate: computeDeclaration(data, { ...options, includeDeductions }),
    estimateIncludesDeductions: includeDeductions,
  };
};
