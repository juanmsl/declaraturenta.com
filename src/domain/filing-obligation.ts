import { UVT_2025, uvtToPesos } from './uvt';

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

export const FILING_TESTS: readonly FilingTest[] = [
  { id: 'grossAssets', limitUvt: 4500, comparison: 'above' },
  { id: 'grossIncome', limitUvt: 1400, comparison: 'atLeast' },
  { id: 'creditCardPurchases', limitUvt: 1400, comparison: 'above' },
  { id: 'totalPurchases', limitUvt: 1400, comparison: 'above' },
  { id: 'deposits', limitUvt: 1400, comparison: 'above' },
];

export type FilingTestResult = FilingTest & {
  limit: number;
  value: number;
  exceeds: boolean;
};

export type FilingObligation = {
  tests: FilingTestResult[];
  exceededCount: number;
  mustFile: boolean;
};

export const evaluateFilingObligation = (
  values: Record<FilingTestId, number>,
  uvtValue: number = UVT_2025,
): FilingObligation => {
  const tests = FILING_TESTS.map(test => {
    const limit = uvtToPesos(test.limitUvt, uvtValue);
    const value = values[test.id];
    const exceeds = test.comparison === 'atLeast' ? value >= limit : value > limit;
    return { ...test, limit, value, exceeds };
  });
  const exceededCount = tests.filter(test => test.exceeds).length;

  return { tests, exceededCount, mustFile: exceededCount > 0 };
};
