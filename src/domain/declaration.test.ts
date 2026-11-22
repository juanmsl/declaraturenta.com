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

describe('capital and non-labor income', () => {
  const withOtherIncome = {
    ...sampleDeclaration,
    capital: {
      concepts: [
        {
          id: 'cdt',
          label: 'CDT',
          entity: 'Banco',
          amount: 10_000_000,
          origin: 'exogenous' as const,
          financial: true,
        },
        { id: 'rent', label: 'Otro', entity: 'X', amount: 2_000_000, origin: 'user' as const },
      ],
      independentContributions: 1_000,
      costConcepts: [],
    },
    nonLabor: {
      concepts: [
        {
          id: 'other',
          label: 'Otros ingresos',
          entity: 'Y',
          amount: 3_000_000,
          origin: 'exogenous' as const,
        },
      ],
      returnConcepts: [],
      contributionConcepts: [],
      costConcepts: [{ id: 'cost', label: 'Costos', entity: '', amount: 500_000, origin: 'user' as const }],
    },
  };

  it('removes the inflationary component (55,43 %) only from financial yields', () => {
    const result = computeDeclaration(withOtherIncome);
    expect(result.capital.grossIncome).toBe(12_000_000);
    expect(result.capital.inflationComponent).toBe(5_543_000);
    expect(result.capital.nonTaxableIncome).toBe(5_544_000);
    expect(result.capital.netIncome).toBe(6_456_000);
    expect(result.nonLabor.netIncome).toBe(2_500_000);
  });

  it('adds every schedule to box 91 and to the filing test', () => {
    const result = computeDeclaration(withOtherIncome);
    expect(result.generalNetIncome).toBe(163_800_000 + 6_456_000 + 2_500_000);
    expect(result.grossIncome).toBe(180_000_000 + 12_000_000 + 3_000_000);
  });

  it('applies the 40 % cap to the whole general schedule', () => {
    const result = computeDeclaration(withOtherIncome);
    // 40 % of the whole schedule is above 1.340 UVT, so the UVT limit applies.
    expect(Math.round(result.generalNetIncome * 0.4)).toBeGreaterThan(66_730_660);
    expect(result.labor.benefitsCap).toBe(66_730_660);
    expect(result.taxableIncome).toBe(result.generalNetIncome - result.totalBenefits);
  });

  it('takes the 40 % cap base from gross income minus non-taxable income, without costs', () => {
    const result = computeDeclaration(withOtherIncome);
    // 32 + 58 + 74 − 33 − 59 − 76: the 500.000 of costs in box 77 do not reduce the base.
    expect(result.benefitsCapBase).toBe(195_000_000 - 16_200_000 - 5_544_000);
    expect(result.benefitsCapBase).toBeGreaterThan(result.generalNetIncome);
  });
});
