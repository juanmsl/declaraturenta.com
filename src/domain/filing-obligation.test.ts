import { AG_2025 } from './tax-years';
import { evaluateFilingObligation, quickFilingCheck } from './filing-obligation';

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

describe('quickFilingCheck', () => {
  const no = {
    assetsAbove: false,
    creditCardAbove: false,
    purchasesAbove: false,
    depositsAbove: false,
    vatResponsible: false,
  };

  it('multiplies the monthly salary by 12 against 1.400 UVT', () => {
    const check = quickFilingCheck({ ...no, monthlySalary: 6_500_000 }, AG_2025);
    expect(check.annualIncome).toBe(78_000_000);
    expect(check.incomeLimit).toBe(69_718_600);
    expect(check.mustFile).toBe(true);
    expect(quickFilingCheck({ ...no, monthlySalary: 5_000_000 }, AG_2025).mustFile).toBe(false);
  });

  it('files for any other yes, VAT included', () => {
    expect(quickFilingCheck({ ...no, monthlySalary: 0, vatResponsible: true }, AG_2025).mustFile).toBe(true);
    expect(quickFilingCheck({ ...no, monthlySalary: 0, depositsAbove: true }, AG_2025).otherReasons).toBe(1);
  });

  it('counts VAT in the full evaluation too', () => {
    const zero = { grossAssets: 0, grossIncome: 0, creditCardPurchases: 0, totalPurchases: 0, deposits: 0 };
    expect(evaluateFilingObligation(zero, AG_2025, true).mustFile).toBe(true);
  });
});
