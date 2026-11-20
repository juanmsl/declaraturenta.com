import { computeGeneralBenefits, severanceExemptShare } from './general-benefits';
import type { GeneralBenefitsInput } from './general-benefits';
import { AG_2025 } from './tax-years';

const zero = { labor: 0, fees: 0, capital: 0, nonLabor: 0 };

/** The sample taxpayer: only labor income. */
const laura: GeneralBenefitsInput = {
  includeDeductions: true,
  netIncome: { ...zero, labor: 163_800_000 },
  grossIncome: { ...zero, labor: 180_000_000 },
  capBase: 163_800_000,
  voluntaryContributions: 0,
  housingInterestPaid: 14_400_000,
  prepaidHealthPaid: 4_800_000,
  dependents: 1,
  severanceReceived: 0,
  severanceAverageSalary: null,
  salaries: 180_000_000,
  otherLaborExempt: 0,
  gmfPaid: 0,
  icetexInterest: 0,
  independentSeverance: 0,
  unlimitedExempt: { amount: 0, column: 'labor' },
};

describe('computeGeneralBenefits', () => {
  it('matches the sample taxpayer with deductions', () => {
    const result = computeGeneralBenefits(laura, AG_2025);
    const { labor } = result.columns;
    expect(labor.housing).toBe(14_400_000);
    expect(result.detail.dependent).toBe(18_000_000);
    expect(result.detail.prepaidHealth).toBe(4_800_000);
    expect(labor.otherDeductions).toBe(22_800_000);
    expect(labor.totalDeductions).toBe(37_200_000);
    expect(result.detail.exempt25).toBe(31_650_000);
    expect(result.beforeCap).toBe(68_850_000);
    expect(result.cap).toBe(65_520_000);
    expect(labor.limited).toBe(65_520_000);
    expect(result.excess).toBe(3_330_000);
  });

  it('matches the sample taxpayer before the deductions step', () => {
    const result = computeGeneralBenefits({ ...laura, includeDeductions: false }, AG_2025);
    expect(result.columns.labor.totalDeductions).toBe(0);
    expect(result.detail.exempt25).toBe(39_341_210);
    expect(result.columns.labor.limited).toBe(39_341_210);
  });

  it('limits each deduction', () => {
    const result = computeGeneralBenefits(
      {
        ...laura,
        grossIncome: { ...zero, labor: 400_000_000 },
        netIncome: { ...zero, labor: 400_000_000 },
        housingInterestPaid: 80_000_000,
        prepaidHealthPaid: 12_000_000,
        gmfPaid: 2_000_000,
        icetexInterest: 9_000_000,
      },
      AG_2025,
    );
    expect(result.detail.housingInterest).toBe(59_758_800);
    expect(result.detail.dependent).toBe(19_122_816);
    expect(result.detail.prepaidHealth).toBe(9_561_408);
    expect(result.detail.gmf).toBe(1_000_000);
    expect(result.detail.icetex).toBe(4_979_900);
  });

  it('caps benefits at 1.340 UVT when 40 % is higher', () => {
    const result = computeGeneralBenefits({ ...laura, capBase: 400_000_000 }, AG_2025);
    expect(result.cap).toBe(66_730_660);
  });

  it('limits AFC/FVP/AVC to 30 % of gross income and allocates them by column', () => {
    const result = computeGeneralBenefits(
      {
        ...laura,
        voluntaryContributions: 100_000_000,
        grossIncome: { ...zero, labor: 100_000_000, capital: 20_000_000 },
        netIncome: { ...zero, labor: 10_000_000, capital: 20_000_000 },
      },
      AG_2025,
    );
    expect(result.detail.voluntaryContributionsAllowed).toBe(36_000_000);
    expect(result.columns.labor.voluntaryContributions).toBe(10_000_000);
    expect(result.columns.capital.voluntaryContributions).toBe(20_000_000);
  });

  it('exempts severance pay by salary and keeps it out of the 25 %', () => {
    expect(severanceExemptShare(15_000_000, AG_2025)).toBe(1);
    expect(severanceExemptShare(19_000_000, AG_2025)).toBe(0.9);
    expect(severanceExemptShare(40_000_000, AG_2025)).toBe(0);
    const result = computeGeneralBenefits({ ...laura, severanceReceived: 7_250_000 }, AG_2025);
    expect(result.detail.severanceAverageSalary).toBe(15_000_000);
    expect(result.detail.severanceExempt).toBe(7_250_000);
    expect(result.detail.exempt25).toBe(29_837_500);
  });

  it('adds exempt income without the 40 % cap on top of it', () => {
    const result = computeGeneralBenefits(
      { ...laura, unlimitedExempt: { amount: 10_000_000, column: 'labor' } },
      AG_2025,
    );
    expect(result.columns.labor.unlimitedExempt).toBe(10_000_000);
    expect(result.columns.labor.limited).toBe(75_520_000);
  });

  it('caps independent severance contributions at 1/12 of fees income', () => {
    const result = computeGeneralBenefits(
      {
        ...laura,
        grossIncome: { ...zero, fees: 60_000_000 },
        netIncome: { ...zero, fees: 40_000_000 },
        independentSeverance: 9_000_000,
      },
      AG_2025,
    );
    expect(result.columns.fees.otherDeductions).toBe(5_000_000);
  });
});
