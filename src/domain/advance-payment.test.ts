import { AG_2025 } from './tax-years';
import { computeAdvancePayment } from './advance-payment';

describe('computeAdvancePayment', () => {
  it('is zero for the sample taxpayer because withholdings cover it', () => {
    const result = computeAdvancePayment(
      {
        filingCount: 'third-or-more',
        currentNetTax: 9_591_000,
        previousNetTax: 7_400_000,
        withholdings: 11_240_000,
      },
      AG_2025,
    );
    expect(result.rate).toBe(0.75);
    expect(result.amount).toBe(0);
  });

  it('uses the lower procedure', () => {
    const result = computeAdvancePayment(
      {
        filingCount: 'second',
        currentNetTax: 10_000_000,
        previousNetTax: 4_000_000,
        withholdings: 1_000_000,
      },
      AG_2025,
    );
    expect(result.averageMethod).toBe(2_500_000);
    expect(result.currentMethod).toBe(4_000_000);
    expect(result.amount).toBe(2_500_000);
  });

  it('only uses the current year on the first return', () => {
    const result = computeAdvancePayment(
      {
        filingCount: 'first',
        currentNetTax: 10_000_000,
        previousNetTax: 0,
        withholdings: 0,
      },
      AG_2025,
    );
    expect(result.averageMethod).toBeNull();
    expect(result.amount).toBe(2_500_000);
  });
});
