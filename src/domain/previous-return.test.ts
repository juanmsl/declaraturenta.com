import { parsePreviousReturn, PreviousReturnError } from './previous-return';
import type { PageText } from './previous-return';

const value = (text: string, baseline: number, right = 590): PageText => ({
  text,
  x: right - text.length * 4.5,
  right,
  baseline,
});

/** Positions of the DIAN PDF with fictional values (Laura Gómez, AG 2024). */
const page: PageText[] = [
  ...['2', '0', '2', '4'].map((digit, index) => ({
    text: digit,
    x: 67.9 + index * 10.7,
    right: 72.3 + index * 10.7,
    baseline: 69.5,
  })),
  value('208,500,000', 198.5),
  value('734,000', 186.5),
  value('7,500,000', 546.5),
  value('7,500,000', 582.5),
  value('2,100,000', 630.5),
  value('1,200,000', 654.5),
  // Box 136 shares the row of 137, further left.
  value('0', 654.5, 451),
];

describe('parsePreviousReturn', () => {
  it('reads the year and the four boxes by their position', () => {
    expect(parsePreviousReturn(page, { width: 612, height: 792 })).toEqual({
      year: 2024,
      values: { netAssets: 208_500_000, netTax: 7_500_000, advance: 2_100_000, balanceInFavor: 1_200_000 },
    });
  });

  it('works when the page is scaled', () => {
    const scaled = page.map(item => ({
      ...item,
      x: item.x * 2,
      right: item.right * 2,
      baseline: item.baseline * 2,
    }));
    expect(parsePreviousReturn(scaled, { width: 1224, height: 1584 }).values.netTax).toBe(7_500_000);
  });

  it('rejects a PDF that is not a 210 printed by the DIAN', () => {
    expect(() => parsePreviousReturn([value('Hola', 300)], { width: 612, height: 792 })).toThrow(
      PreviousReturnError,
    );
    const withoutYear = page.filter(item => item.baseline !== 69.5);
    expect(() => parsePreviousReturn(withoutYear, { width: 612, height: 792 })).toThrow(PreviousReturnError);
  });
});
