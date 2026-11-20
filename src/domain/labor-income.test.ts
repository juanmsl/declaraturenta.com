import { AG_2025 } from './tax-years';
import { computeLaborIncome } from './labor-income';
import type { LaborIncomeInput } from './labor-income';

const laura: LaborIncomeInput = {
  grossIncome: 180_000_000,
  nonTaxableIncome: 16_200_000,
  voluntaryContributions: 0,
  housingInterestPaid: 14_400_000,
  prepaidHealthPaid: 4_800_000,
  hasDependent: true,
  includeDeductions: true,
};

describe('computeLaborIncome', () => {
  it('matches the sample taxpayer with deductions', () => {
    const result = computeLaborIncome(laura, AG_2025);
    expect(result.netIncome).toBe(163_800_000);
    expect(result.housingDeduction).toBe(14_400_000);
    expect(result.dependent).toBe(18_000_000);
    expect(result.prepaidHealth).toBe(4_800_000);
    expect(result.otherDeductions).toBe(22_800_000);
    expect(result.totalDeductions).toBe(37_200_000);
    expect(result.exempt25).toBe(31_650_000);
    expect(result.benefitsBeforeCap).toBe(68_850_000);
    expect(result.benefitsCap).toBe(65_520_000);
    expect(result.cappedBenefits).toBe(65_520_000);
    expect(result.benefitsExcess).toBe(3_330_000);
    expect(result.ordinaryNetIncome).toBe(98_280_000);
  });

  it('matches the sample taxpayer before the deductions step', () => {
    const result = computeLaborIncome({ ...laura, includeDeductions: false }, AG_2025);
    expect(result.totalDeductions).toBe(0);
    expect(result.exempt25).toBe(39_341_210);
    expect(result.ordinaryNetIncome).toBe(124_458_790);
  });

  it('limits each deduction', () => {
    const result = computeLaborIncome(
      {
        ...laura,
        grossIncome: 400_000_000,
        housingInterestPaid: 80_000_000,
        prepaidHealthPaid: 12_000_000,
      },
      AG_2025,
    );
    expect(result.housingDeduction).toBe(59_758_800);
    expect(result.dependent).toBe(19_122_816);
    expect(result.prepaidHealth).toBe(9_561_408);
  });

  it('caps benefits at 1.340 UVT when 40 % is higher', () => {
    const result = computeLaborIncome({ ...laura, grossIncome: 400_000_000, nonTaxableIncome: 0 }, AG_2025);
    expect(result.benefitsCap).toBe(66_730_660);
  });
});
