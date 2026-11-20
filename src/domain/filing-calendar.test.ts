import { findFilingDeadline } from './filing-calendar';
import { AG_2025 } from './tax-years';

describe('findFilingDeadline', () => {
  it('maps the last two digits to the 2026 calendar', () => {
    expect(findFilingDeadline('01', AG_2025)).toBe('2026-08-12');
    expect(findFilingDeadline('02', AG_2025)).toBe('2026-08-12');
    expect(findFilingDeadline('47', AG_2025)).toBe('2026-09-15');
    expect(findFilingDeadline('91', AG_2025)).toBe('2026-10-20');
    expect(findFilingDeadline('99', AG_2025)).toBe('2026-10-26');
    expect(findFilingDeadline('00', AG_2025)).toBe('2026-10-26');
  });

  it('uses only the last two digits of a full document number', () => {
    expect(findFilingDeadline('9876543247', AG_2025)).toBe('2026-09-15');
  });
});
