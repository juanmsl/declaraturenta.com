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
    expect(result.dependentsAddition).toBe(3_585_528);
    expect(result.taxableIncome).toBe(94_694_472);
    expect(result.netIncomeTax).toBe(8_587_000);
    expect(result.advance.amount).toBe(0);
    expect(result.amountToPay).toBe(0);
    expect(result.amountInFavor).toBe(2_653_000);
  });

  it('caps box 139 at the labor ordinary income (boxes 42 + 57)', () => {
    const result = computeDeclaration({
      ...sampleDeclaration,
      labor: { ...sampleDeclaration.labor, salaries: 6_000_000, concepts: [], nonTaxableIncome: 0 },
      deductions: { ...sampleDeclaration.deductions, dependents: 4 },
    });
    expect(result.dependentsAddition).toBe(result.labor.netIncome - result.labor.cappedBenefits);
    expect(result.dependentsAddition).toBeLessThan(14_342_112);
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

  it('applies box 28 and box 139 with their caps', () => {
    const result = computeDeclaration({
      ...sampleDeclaration,
      general: { ...sampleDeclaration.general, electronicInvoicePurchases: 20_000_000 },
      deductions: { ...sampleDeclaration.deductions, dependents: 6 },
    });
    expect(result.electronicInvoiceDeduction).toBe(11_951_760);
    expect(result.dependentsAddition).toBe(14_342_112);
    expect(result.totalBenefits).toBe(65_520_000 + 11_951_760 + 14_342_112);
    expect(result.taxableIncome).toBe(163_800_000 - result.totalBenefits);
  });
});
