import { AG_2025 } from './tax-years';
import { pesosToUvt, roundToThousand, uvtToPesos } from './uvt';

describe('uvt', () => {
  it('converts UVT to pesos with the 2025 value', () => {
    expect(uvtToPesos(1400, AG_2025)).toBe(69_718_600);
    expect(uvtToPesos(4500, AG_2025)).toBe(224_095_500);
    expect(uvtToPesos(790, AG_2025)).toBe(39_341_210);
  });

  it('converts pesos to UVT', () => {
    expect(pesosToUvt(98_280_000, AG_2025)).toBeCloseTo(1973.53, 2);
  });

  it('rounds to the nearest thousand', () => {
    expect(roundToThousand(9_590_744)).toBe(9_591_000);
    expect(roundToThousand(16_920_499)).toBe(16_920_000);
  });
});
