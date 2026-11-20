import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import type { ReactNode } from 'react';

import { computeDeclaration } from '@/domain/declaration';
import { getTaxYear } from '@/domain/tax-years';

import { DeclarationContext } from './declaration-context';
import { declarationReducer, effectiveData } from './declaration-state';
import type { DeclarationAction, DeclarationState } from './declaration-state';
import { loadSelectedYear, loadState, saveSelectedYear, saveState } from './storage';
import { TaxYearContext } from './tax-year-context';

type DeclarationProviderProps = {
  children: ReactNode;
  /** Initial state for tests. Defaults to what is saved in localStorage for the selected year. */
  initialState?: DeclarationState;
};

/**
 * Holds the selected taxable year and its return, and saves every change to localStorage. Changing
 * the year remounts the return so each year keeps its own state (ADR 0034).
 */
export const DeclarationProvider = ({ children, initialState }: DeclarationProviderProps) => {
  const [year, setYear] = useState(() => initialState?.taxYear ?? loadSelectedYear());
  const taxYear = getTaxYear(year);

  const selectYear = useCallback((next: number) => {
    saveSelectedYear(next);
    setYear(next);
  }, []);

  const yearValue = useMemo(() => ({ taxYear, selectYear }), [taxYear, selectYear]);

  return (
    <TaxYearContext value={yearValue}>
      <YearDeclaration
        key={taxYear.year}
        year={taxYear.year}
        initialState={initialState?.taxYear === taxYear.year ? initialState : undefined}
      >
        {children}
      </YearDeclaration>
    </TaxYearContext>
  );
};

const YearDeclaration = ({ children, initialState, year }: DeclarationProviderProps & { year: number }) => {
  const [state, rawDispatch] = useReducer(declarationReducer, initialState, init => init ?? loadState(year));
  const taxYear = getTaxYear(state.taxYear);

  const dispatch = useCallback((action: DeclarationAction) => {
    rawDispatch({ ...action, at: new Date().toISOString() });
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo(() => {
    const includeDeductions = state.visitedSteps.includes('deductions');
    const data = effectiveData(state);
    return {
      state,
      dispatch,
      result: computeDeclaration(data, { taxYear, filingDeadline: state.taxpayer.filingDeadline }),
      estimate: computeDeclaration(data, {
        includeDeductions,
        taxYear,
        filingDeadline: state.taxpayer.filingDeadline,
      }),
      estimateIncludesDeductions: includeDeductions,
    };
  }, [state, dispatch, taxYear]);

  return <DeclarationContext value={value}>{children}</DeclarationContext>;
};
