import { uvtToPesos } from './tax-years';
import type { TaxYearConfig } from './tax-years';

/**
 * The five tests that make a natural person resident in Colombia obliged to file for the
 * taxable year (arts. 592, 593 and 594-3 E.T.). Exceeding any one of them is enough.
 */
export type FilingTestId =
  'grossAssets' | 'grossIncome' | 'creditCardPurchases' | 'totalPurchases' | 'deposits';

type FilingTest = {
  id: FilingTestId;
  limitUvt: number;
  /**
   * `atLeast`: obliged when the value is equal to or above the limit (gross income, art. 593).
   * `above`: obliged when the value exceeds the limit (assets and art. 594-3 tests).
   */
  comparison: 'above' | 'atLeast';
};

const FILING_TESTS: readonly Omit<FilingTest, 'limitUvt'>[] = [
  { id: 'grossAssets', comparison: 'above' },
  { id: 'grossIncome', comparison: 'atLeast' },
  { id: 'creditCardPurchases', comparison: 'above' },
  { id: 'totalPurchases', comparison: 'above' },
  { id: 'deposits', comparison: 'above' },
];

export type FilingTestResult = FilingTest & {
  limit: number;
  value: number;
  exceeds: boolean;
};

export type FilingObligation = {
  tests: FilingTestResult[];
  exceededCount: number;
  /** Responsable de IVA: obliged to file even below every test (art. 592 num. 3 E.T.). */
  vatResponsible: boolean;
  mustFile: boolean;
};

export const evaluateFilingObligation = (
  values: Record<FilingTestId, number>,
  year: TaxYearConfig,
  vatResponsible = false,
): FilingObligation => {
  const tests = FILING_TESTS.map(test => {
    const limitUvt = year.filingTestsUvt[test.id];
    const limit = uvtToPesos(limitUvt, year);
    const value = values[test.id];
    const exceeds = test.comparison === 'atLeast' ? value >= limit : value > limit;
    return { ...test, limitUvt, limit, value, exceeds };
  });
  const exceededCount = tests.filter(test => test.exceeds).length;

  return { tests, exceededCount, vatResponsible, mustFile: exceededCount > 0 || vatResponsible };
};

/** Answers of the landing's quick check (ADR 0035): a monthly salary and yes/no questions. */
export type QuickFilingAnswers = {
  monthlySalary: number;
  assetsAbove: boolean;
  creditCardAbove: boolean;
  purchasesAbove: boolean;
  depositsAbove: boolean;
  vatResponsible: boolean;
};

export type QuickFilingCheck = {
  /** Monthly salary × 12. */
  annualIncome: number;
  /** Income test limit in pesos (1.400 UVT for AG 2025). */
  incomeLimit: number;
  incomeExceeds: boolean;
  /** Yes answers to the other tests. */
  otherReasons: number;
  mustFile: boolean;
};

/**
 * Rough filing check for the landing page: the salary of a year against the income test, plus the
 * person's own answers for the other tests. Inside the app every test uses the real data.
 */
export const quickFilingCheck = (answers: QuickFilingAnswers, year: TaxYearConfig): QuickFilingCheck => {
  const annualIncome = Math.max(0, answers.monthlySalary) * 12;
  const incomeLimit = uvtToPesos(year.filingTestsUvt.grossIncome, year);
  const incomeExceeds = annualIncome >= incomeLimit;
  const otherReasons = [
    answers.assetsAbove,
    answers.creditCardAbove,
    answers.purchasesAbove,
    answers.depositsAbove,
    answers.vatResponsible,
  ].filter(Boolean).length;
  return {
    annualIncome,
    incomeLimit,
    incomeExceeds,
    otherReasons,
    mustFile: incomeExceeds || otherReasons > 0,
  };
};
