import { detectZeroSlip } from './zero-slip';

describe('detectZeroSlip', () => {
  it('flags a missing or extra zero', () => {
    expect(detectZeroSlip(1_800_000, 180_000_000)).toBeNull();
    expect(detectZeroSlip(18_000_000, 180_000_000)).toBe('missing');
    expect(detectZeroSlip(1_800_000_000, 180_000_000)).toBe('extra');
  });

  it('ignores close values and empty ones', () => {
    expect(detectZeroSlip(176_000_000, 180_000_000)).toBeNull();
    expect(detectZeroSlip(0, 180_000_000)).toBeNull();
  });
});
