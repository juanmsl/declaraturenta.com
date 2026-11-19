import { describe, expect, it } from 'vitest';

import { computeDeclaration, createEmptyDeclaration } from './declaration';
import type { DeclarationData } from './declaration';
import { sampleDeclaration } from '@/mocks/sample-declaration';

const withFees = (
  data: DeclarationData,
  amount: number,
  costs: number,
  nonTaxableIncome = 0,
): DeclarationData => ({
  ...data,
  labor: { ...data.labor, hasIndependentIncome: true },
  fees: {
    concepts: [{ id: 'fees', label: 'Honorarios', entity: 'Cliente Sabana S.A.S.', amount, origin: 'user' }],
    nonTaxableIncome,
    costs,
    option: null,
  },
});

describe('fees (honorarios)', () => {
  it('puts fees in boxes 43 to 46 when costs are subtracted', () => {
    const result = computeDeclaration({
      ...withFees(sampleDeclaration, 60_000_000, 10_000_000, 6_000_000),
      fees: { ...withFees(sampleDeclaration, 60_000_000, 10_000_000, 6_000_000).fees, option: 'costs' },
    });
    expect(result.fees.option).toBe('costs');
    expect(result.fees.grossIncome).toBe(60_000_000);
    expect(result.fees.netIncome).toBe(44_000_000);
    expect(result.grossLaborIncome).toBe(180_000_000);
    // Cap base: gross income minus non-taxable income, without the costs.
    expect(result.benefitsCapBase).toBe(240_000_000 - 16_200_000 - 6_000_000);
  });

  it('adds fees to box 32 with the 25 % exempt option', () => {
    const data = withFees(sampleDeclaration, 60_000_000, 10_000_000, 6_000_000);
    const result = computeDeclaration({ ...data, fees: { ...data.fees, option: 'exempt' } });
    expect(result.fees.grossIncome).toBe(0);
    expect(result.grossLaborIncome).toBe(240_000_000);
    expect(result.labor.nonTaxableIncome).toBe(22_200_000);
  });

  it('suggests and applies the option that leaves less tax while the person has not chosen', () => {
    const result = computeDeclaration(withFees(sampleDeclaration, 60_000_000, 10_000_000));
    const comparison = result.feesComparison;
    expect(comparison).not.toBeNull();
    expect(comparison?.suggested).toBe(
      (comparison?.costs ?? 0) < (comparison?.exempt ?? 0) ? 'costs' : 'exempt',
    );
    expect(result.fees.option).toBe(comparison?.suggested);
    expect(result.taxDue).toBe(Math.min(comparison?.costs ?? 0, comparison?.exempt ?? 0));
  });

  it('suggests the 25 % exempt option when there are no costs', () => {
    const result = computeDeclaration(withFees(createEmptyDeclaration(), 120_000_000, 0));
    expect(result.feesComparison?.suggested).toBe('exempt');
  });

  it('flags box 140 when costs are above 60 % of the fees', () => {
    const data = withFees(createEmptyDeclaration(), 100_000_000, 70_000_000);
    const result = computeDeclaration({ ...data, fees: { ...data.fees, option: 'costs' } });
    expect(result.fees.exceedsIndicativeCap).toBe(true);
  });

  it('never puts more than box 34 in box 41, and passes the rest to 53', () => {
    const data = withFees(createEmptyDeclaration(), 100_000_000, 0);
    const result = computeDeclaration({
      ...data,
      labor: { ...data.labor, salaries: 5_000_000 },
      deductions: { ...data.deductions, housingInterestPaid: 20_000_000 },
      fees: { ...data.fees, option: 'costs' },
    });
    expect(result.limitedBenefits.labor).toBe(5_000_000);
    expect(result.limitedBenefits.fees).toBe(result.labor.cappedBenefits - 5_000_000);
  });

  it('has no comparison without fees', () => {
    expect(computeDeclaration(sampleDeclaration).feesComparison).toBeNull();
  });
});
