import { describe, expect, it } from 'vitest';

import { AG_2025 } from './tax-years';

import { computeDeclaration, createEmptyDeclaration } from './declaration';
import { computeDividends, computeOccasionalGains, computePensions } from './other-schedules';
import type { DividendConcept, OccasionalGainConcept } from './other-schedules';
const UVT_2025 = AG_2025.uvt;
import { sampleDeclaration } from '@/mocks/sample-declaration';

const dividend = (kind: DividendConcept['kind'], amount: number): DividendConcept => ({
  id: kind,
  label: 'Dividendos',
  entity: 'Sociedad Andina S.A.',
  kind,
  amount,
  origin: 'user',
});

const gain = (kind: OccasionalGainConcept['kind'], amount: number, cost = 0): OccasionalGainConcept => ({
  id: `${kind}-${String(amount)}`,
  label: 'Ganancia',
  entity: '',
  kind,
  amount,
  cost,
  origin: 'user',
});

describe('computePensions', () => {
  const pension = {
    id: 'p',
    label: 'Pensión de vejez',
    entity: 'Fondo Altiplano',
    amount: 0,
    origin: 'user' as const,
  };

  it('exempts up to 1.000 UVT per month of pension (box 102)', () => {
    const result = computePensions(
      {
        concepts: [{ ...pension, amount: 60_000_000 }],
        nonTaxableIncome: 7_200_000,
        months: 12,
      },
      AG_2025,
    );
    expect(result.netIncome).toBe(52_800_000);
    expect(result.exemptIncome).toBe(52_800_000);
    expect(result.taxableIncome).toBe(0);
  });

  it('taxes what goes above the monthly limit', () => {
    const result = computePensions(
      {
        concepts: [{ ...pension, amount: 120_000_000 }],
        nonTaxableIncome: 0,
        months: 2,
      },
      AG_2025,
    );
    expect(result.exemptIncome).toBe(2000 * UVT_2025);
    expect(result.taxableIncome).toBe(120_000_000 - 2000 * UVT_2025);
  });
});

describe('computeDividends', () => {
  it('applies 35 % to the second subcédula and the 19 % discount above 1.090 UVT', () => {
    const result = computeDividends(
      [dividend('first-subcedule', 80_000_000), dividend('second-subcedule', 10_000_000)],
      AG_2025,
    );
    expect(result.secondSubceduleTax).toBe(3_500_000);
    expect(result.baseForTable).toBe(86_500_000);
    // (86.500.000 / 49.799 − 1.090) × 19 % × 49.799, rounded to thousands.
    expect(result.discount).toBe(
      Math.round(((86_500_000 / UVT_2025 - 1090) * 0.19 * UVT_2025) / 1000) * 1000,
    );
  });

  it('gives no discount up to 1.090 UVT', () => {
    expect(computeDividends([dividend('first-subcedule', 50_000_000)], AG_2025).discount).toBe(0);
  });

  it('separates the non-taxable part of 2016 and earlier (boxes 104 to 106)', () => {
    const result = computeDividends(
      [dividend('until-2016-non-taxed', 4_000_000), dividend('until-2016-taxed', 1_000_000)],
      AG_2025,
    );
    expect(result.until2016).toBe(5_000_000);
    expect(result.until2016NonTaxed).toBe(4_000_000);
    expect(result.until2016Net).toBe(1_000_000);
    expect(result.until2016Tax).toBe(0);
  });

  it('taxes foreign dividends at 35 % (box 120)', () => {
    expect(computeDividends([dividend('foreign', 2_000_000)], AG_2025).foreignTax).toBe(700_000);
  });
});

describe('computeOccasionalGains', () => {
  it('taxes lotteries at 20 % and the rest at 15 %', () => {
    const result = computeOccasionalGains(
      [gain('lottery', 10_000_000), gain('asset-sale', 50_000_000, 30_000_000)],
      AG_2025,
    );
    expect(result.grossIncome).toBe(60_000_000);
    expect(result.costs).toBe(30_000_000);
    expect(result.taxable).toBe(30_000_000);
    expect(result.tax).toBe(2_000_000 + 3_000_000);
  });

  it('exempts the first 13.000 UVT of the inherited home', () => {
    const result = computeOccasionalGains([gain('inherited-home', 800_000_000)], AG_2025);
    expect(result.exempt).toBe(13_000 * UVT_2025);
  });

  it('applies the 3.250 UVT cap once to all inheritances of the same kind', () => {
    const result = computeOccasionalGains(
      [gain('inheritance', 100_000_000), gain('inheritance', 100_000_000)],
      AG_2025,
    );
    expect(result.exempt).toBe(3250 * UVT_2025);
  });

  it('exempts 20 % of a gift, up to 1.625 UVT', () => {
    expect(computeOccasionalGains([gain('gift', 10_000_000)], AG_2025).exempt).toBe(2_000_000);
    expect(computeOccasionalGains([gain('gift', 1_000_000_000)], AG_2025).exempt).toBe(1625 * UVT_2025);
  });

  it('only exempts a home sale when the money went to AFC or the mortgage', () => {
    expect(computeOccasionalGains([gain('home-sale', 400_000_000, 100_000_000)], AG_2025).exempt).toBe(0);
    const toAfc = { ...gain('home-sale', 400_000_000, 100_000_000), toAfcOrMortgage: true };
    expect(computeOccasionalGains([toAfc], AG_2025).exempt).toBe(5000 * UVT_2025);
  });
});

describe('other schedules in the return', () => {
  it('adds pensions and dividends to box 111 and occasional gains to the tax due', () => {
    const base = computeDeclaration(sampleDeclaration);
    const result = computeDeclaration({
      ...sampleDeclaration,
      pensions: {
        concepts: [{ id: 'p', label: 'Pensión', entity: 'Fondo', amount: 10_000_000, origin: 'user' }],
        nonTaxableIncome: 0,
        months: 0,
      },
      dividends: { concepts: [dividend('first-subcedule', 20_000_000)] },
      occasionalGains: { concepts: [gain('lottery', 5_000_000)] },
    });
    expect(result.taxableIncome).toBe(base.taxableIncome);
    expect(result.tableBase).toBe(base.taxableIncome + 10_000_000 + 20_000_000);
    expect(result.occasionalGainsTax).toBe(1_000_000);
    expect(result.taxDue).toBe(result.netIncomeTax + 1_000_000);
    // Pensions, dividends and occasional gains all count for the 1.400 UVT test.
    expect(result.grossIncome).toBe(base.grossIncome + 30_000_000 + 5_000_000);
  });

  it('makes a person file because of an inheritance alone', () => {
    const result = computeDeclaration({
      ...createEmptyDeclaration(),
      occasionalGains: { concepts: [gain('inherited-home', 100_000_000)] },
    });
    // The whole inheritance is exempt, but it still counts as gross income for filing.
    expect(result.occasionalGainsTax).toBe(0);
    expect(result.obligation.tests.find(test => test.id === 'grossIncome')?.exceeds).toBe(true);
  });

  it('keeps the sample taxpayer unchanged', () => {
    const result = computeDeclaration(sampleDeclaration);
    expect(result.tableBase).toBe(result.taxableIncome);
    expect(result.netIncomeTax).toBe(8_587_000);
  });
});
