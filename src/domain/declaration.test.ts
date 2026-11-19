import { sampleDeclaration } from '@/mocks/sample-declaration';

import { computeDeclaration } from './declaration';

describe('computeDeclaration', () => {
  it('reproduces every figure of the sample taxpayer', () => {
    const result = computeDeclaration(sampleDeclaration);
    expect(result.obligation.exceededCount).toBe(4);
    expect(result.grossAssets).toBe(328_500_000);
    expect(result.totalDebts).toBe(120_000_000);
    expect(result.netAssets).toBe(208_500_000);
    expect(result.grossLaborIncome).toBe(180_000_000);
    expect(result.labor.netIncome).toBe(163_800_000);
    expect(result.labor.cappedBenefits).toBe(65_520_000);
    expect(result.taxableIncome).toBe(98_280_000);
    expect(result.netIncomeTax).toBe(9_591_000);
    expect(result.advance.amount).toBe(0);
    expect(result.amountToPay).toBe(0);
    expect(result.amountInFavor).toBe(1_649_000);
  });

  it('estimates an amount to pay before the deductions step', () => {
    const result = computeDeclaration(sampleDeclaration, { includeDeductions: false });
    expect(result.netIncomeTax).toBe(16_921_000);
    expect(result.amountToPay).toBe(5_681_000);
  });

  it('adds payments missing from the certificate to box 32', () => {
    const result = computeDeclaration({
      ...sampleDeclaration,
      labor: { ...sampleDeclaration.labor, otherPayments: 2_000_000 },
    });
    expect(result.grossLaborIncome).toBe(182_000_000);
  });
});
