import { formatCurrency, formatLongDate } from './format';

describe('formatCurrency', () => {
  it('formats pesos with dots and no decimals', () => {
    expect(formatCurrency(1_649_000)).toBe('$ 1.649.000');
    expect(formatCurrency(180_000_000)).toBe('$ 180.000.000');
  });

  it('keeps the sign before the currency symbol', () => {
    expect(formatCurrency(-9_591_000)).toBe('-$ 9.591.000');
  });

  it('rounds to whole pesos', () => {
    expect(formatCurrency(49_799.4)).toBe('$ 49.799');
  });
});

describe('formatLongDate', () => {
  it('formats dates in Colombian Spanish', () => {
    expect(formatLongDate('2026-09-15')).toBe('15 de septiembre de 2026');
  });
});
