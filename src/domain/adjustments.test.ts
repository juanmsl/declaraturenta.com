import { sampleDeclaration } from '@/mocks/sample-declaration';

import { computeDeclaration, createEmptyAdjustments } from './declaration';
import type { AdjustmentId, DeclarationData } from './declaration';
import { buildForm210 } from './form-210';
import { AG_2025 } from './tax-years';

const withAdjustments = (
  enabled: AdjustmentId[],
  change: Partial<DeclarationData['adjustments']>,
  data: DeclarationData = sampleDeclaration,
): DeclarationData => ({
  ...data,
  adjustments: { ...createEmptyAdjustments(), ...change, enabled },
});

const capitalIncome = (amount: number): DeclarationData => ({
  ...sampleDeclaration,
  capital: {
    ...sampleDeclaration.capital,
    concepts: [{ id: 'rent', label: 'Arriendo', entity: 'Inquilino', amount, origin: 'user' }],
  },
});

describe('«Otros ajustes» and the remaining boxes', () => {
  it('ignores values whose switch is off', () => {
    const result = computeDeclaration(withAdjustments([], { taxableAdditions: 50_000_000 }));
    expect(result.taxableAdditions).toBe(0);
    expect(result.taxableIncome).toBe(94_694_472);
  });

  it('adds rentas gravables (96) to the taxable income without benefits', () => {
    const result = computeDeclaration(
      withAdjustments(['taxable-additions'], { taxableAdditions: 10_000_000 }),
    );
    expect(result.taxableIncome).toBe(104_694_472);
  });

  it('compensates losses of each column only up to its ordinary income (72)', () => {
    const data = withAdjustments(
      ['losses'],
      { losses: { fees: 0, capital: 90_000_000, nonLabor: 0, until2018: 0 } },
      capitalIncome(30_000_000),
    );
    const result = computeDeclaration(data);
    expect(result.compensations.capital).toBe(30_000_000);
    const form = buildForm210(data, result, AG_2025);
    expect(form.get(72)?.value).toBe(30_000_000);
    expect(form.get(73)?.value).toBe(0);
  });

  it('keeps 2018 losses (94) away from labor income', () => {
    const result = computeDeclaration(
      withAdjustments(['losses'], { losses: { fees: 0, capital: 0, nonLabor: 0, until2018: 50_000_000 } }),
    );
    expect(result.compensations.until2018).toBe(0);
  });

  it('adds ECE passive income (62) and its gross income to the 40 % base', () => {
    const result = computeDeclaration(
      withAdjustments(['ece'], {
        ece: { capitalIncome: 20_000_000, capitalCosts: 5_000_000, nonLaborIncome: 0, nonLaborCosts: 0 },
      }),
    );
    expect(result.ece.capital).toBe(15_000_000);
    expect(result.benefitsCapBase).toBe(183_800_000);
  });

  it('limits the foreign tax discount (122) to the Colombian tax on that income', () => {
    const result = computeDeclaration(
      withAdjustments(['foreign-taxes'], { foreignTax: { paid: 50_000_000, foreignIncome: 10_000_000 } }),
    );
    expect(result.foreignTaxDiscount).toBe(907_000);
    expect(result.foreignTaxDiscount).toBeLessThan(result.totalIncomeTax);
  });

  it('discounts 25 % of donations up to 30 % of box 121 (art. 258)', () => {
    const small = computeDeclaration({
      ...sampleDeclaration,
      deductions: { ...sampleDeclaration.deductions, donations: 4_000_000 },
    });
    expect(small.donationsDiscount).toBe(1_000_000);
    const large = computeDeclaration({
      ...sampleDeclaration,
      deductions: { ...sampleDeclaration.deductions, donations: 40_000_000 },
    });
    expect(large.donationsDiscount).toBe(2_576_000);
    expect(large.donationsExcess).toBe(7_424_000);
  });

  it('exempts Andean Community dividends (110) from box 120', () => {
    const data = withAdjustments(
      ['can-dividends'],
      { canDividends: 10_000_000 },
      {
        ...sampleDeclaration,
        dividends: {
          concepts: [
            {
              id: 'f',
              kind: 'foreign',
              label: 'Dividendos',
              entity: 'Andina',
              amount: 10_000_000,
              origin: 'user',
            },
          ],
        },
      },
    );
    const result = computeDeclaration(data);
    expect(result.dividends.foreignExempt).toBe(10_000_000);
    expect(result.dividends.foreignTax).toBe(0);
  });

  it('adds the late filing penalty to box 135 and to the balance', () => {
    const data: DeclarationData = {
      ...sampleDeclaration,
      filing: { ...sampleDeclaration.filing, date: '2026-11-20', priorLateFiling: 'within-a-year' },
    };
    const result = computeDeclaration(data, { filingDeadline: '2026-09-15' });
    expect(result.lateFiling.penalty).toBe(1_288_000);
    expect(result.amountInFavor).toBe(2_653_000 - 1_288_000);
  });

  it('computes the voluntary contribution (141) apart from the balance', () => {
    const result = computeDeclaration({
      ...sampleDeclaration,
      filing: { ...sampleDeclaration.filing, voluntaryContribution: { mode: 'amount', value: 100_000 } },
    });
    expect(result.voluntaryContribution).toBe(100_000);
    expect(result.amountInFavor).toBe(2_653_000);
  });
});
