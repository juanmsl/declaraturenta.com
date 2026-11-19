import { computeTableTax } from './income-tax-table';

describe('computeTableTax', () => {
  it('matches the sample taxpayer after deductions', () => {
    const result = computeTableTax(98_280_000);
    expect(result.taxableUvt).toBeCloseTo(1973.53, 2);
    expect(result.bracket.rate).toBe(0.28);
    expect(result.tax).toBe(9_591_000);
  });

  it('matches the sample taxpayer before deductions', () => {
    expect(computeTableTax(124_458_790).tax).toBe(16_921_000);
  });

  it('charges nothing up to 1.090 UVT', () => {
    expect(computeTableTax(0).tax).toBe(0);
    expect(computeTableTax(54_280_910).tax).toBe(0);
  });

  it('uses the 19 % bracket between 1.090 and 1.700 UVT', () => {
    // 1.400 UVT → (1.400 − 1.090) × 19 % = 58,9 UVT
    expect(computeTableTax(69_718_600).tax).toBe(2_933_000);
  });

  it('uses the top bracket above 31.000 UVT', () => {
    const result = computeTableTax(31_000 * 49_799 + 49_799);
    expect(result.bracket.rate).toBe(0.39);
    expect(result.taxUvt).toBeCloseTo(10_352.39, 2);
  });
});
