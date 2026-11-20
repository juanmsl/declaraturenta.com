import { AG_2025 } from './tax-years';
import { evaluateFilingObligation } from './filing-obligation';

const below = {
  grossAssets: 0,
  grossIncome: 0,
  creditCardPurchases: 0,
  totalPurchases: 0,
  deposits: 0,
};

describe('evaluateFilingObligation', () => {
  it('matches the sample taxpayer: 4 of 5 tests exceeded', () => {
    const result = evaluateFilingObligation(
      {
        grossAssets: 328_500_000,
        grossIncome: 180_000_000,
        creditCardPurchases: 38_200_000,
        totalPurchases: 92_400_000,
        deposits: 185_000_000,
      },
      AG_2025,
    );
    expect(result.exceededCount).toBe(4);
    expect(result.mustFile).toBe(true);
    expect(result.tests.find(test => test.id === 'creditCardPurchases')?.exceeds).toBe(false);
    expect(result.tests.find(test => test.id === 'grossAssets')?.limit).toBe(224_095_500);
  });

  it('does not oblige when every value is below its limit', () => {
    expect(evaluateFilingObligation(below, AG_2025).mustFile).toBe(false);
  });

  it('obliges gross income equal to the limit but not assets equal to the limit', () => {
    expect(evaluateFilingObligation({ ...below, grossIncome: 69_718_600 }, AG_2025).mustFile).toBe(true);
    expect(evaluateFilingObligation({ ...below, grossAssets: 224_095_500 }, AG_2025).mustFile).toBe(false);
  });
});
