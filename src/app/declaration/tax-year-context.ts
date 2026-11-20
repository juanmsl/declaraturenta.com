import { createContext, use } from 'react';

import type { TaxYearConfig } from '@/domain/tax-years';

export type TaxYearContextValue = {
  /** Configuration of the selected taxable year. */
  taxYear: TaxYearConfig;
  /** Opens another year's return (each year is saved apart). */
  selectYear: (year: number) => void;
};

export const TaxYearContext = createContext<TaxYearContextValue | null>(null);

export const useTaxYear = (): TaxYearContextValue => {
  const value = use(TaxYearContext);
  if (!value) throw new Error('useTaxYear must be used inside <DeclarationProvider>');
  return value;
};
