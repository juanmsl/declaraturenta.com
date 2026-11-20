import { computeLateFiling, lateMonths } from './late-filing';
import { AG_2025 } from './tax-years';

const base = {
  deadline: '2026-09-15',
  filingDate: '2026-11-20',
  taxDue: 8_587_000,
  grossIncome: 180_000_000,
  balanceInFavor: 0,
  previousNetAssets: 0,
  summoned: false,
  priorLateFiling: 'within-a-year' as const,
};

describe('late filing', () => {
  it('counts months or fractions of month', () => {
    expect(lateMonths('2026-09-15', '2026-09-15')).toBe(0);
    expect(lateMonths('2026-09-15', '2026-09-16')).toBe(1);
    expect(lateMonths('2026-09-15', '2026-10-15')).toBe(1);
    expect(lateMonths('2026-09-15', '2026-10-16')).toBe(2);
    expect(lateMonths('2026-09-15', '2026-11-20')).toBe(3);
  });

  it('is 5 % of the tax per month (Figma 07b: 3 months of $ 8.587.000)', () => {
    const result = computeLateFiling(base, AG_2025);
    expect(result.months).toBe(3);
    expect(result.penalty).toBe(1_288_000);
  });

  it('applies the art. 640 reductions and the minimum of 10 UVT', () => {
    expect(computeLateFiling({ ...base, priorLateFiling: 'none' }, AG_2025).penalty).toBe(644_000);
    expect(computeLateFiling({ ...base, priorLateFiling: 'more-than-a-year' }, AG_2025).penalty).toBe(
      966_000,
    );
    const small = computeLateFiling({ ...base, taxDue: 1_000_000, priorLateFiling: 'none' }, AG_2025);
    expect(small.minimumApplied).toBe(true);
    expect(small.penalty).toBe(524_000);
  });

  it('uses gross income without tax, capped by twice the balance in favor', () => {
    const result = computeLateFiling({ ...base, taxDue: 0, balanceInFavor: 300_000 }, AG_2025);
    expect(result.base).toBe('income');
    expect(result.penalty).toBe(600_000);
  });

  it('doubles the rate after a summons and does not reduce it', () => {
    const result = computeLateFiling({ ...base, summoned: true, priorLateFiling: 'none' }, AG_2025);
    expect(result.penalty).toBe(2_576_000);
  });

  it('is 0 when filed on time or without a date', () => {
    expect(computeLateFiling({ ...base, filingDate: '2026-09-10' }, AG_2025).penalty).toBe(0);
    expect(computeLateFiling({ ...base, filingDate: null }, AG_2025).penalty).toBe(0);
  });
});
