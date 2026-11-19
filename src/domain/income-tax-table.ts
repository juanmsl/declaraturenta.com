import { pesosToUvt, roundToThousand, UVT_2025 } from './uvt';

/** Marginal tax table for residents' general income (art. 241 E.T.), in UVT. */
export type TaxBracket = {
  fromUvt: number;
  /** `null` for the open top bracket. */
  toUvt: number | null;
  /** Marginal rate as a fraction (0.28 = 28 %). */
  rate: number;
  /** Fixed tax in UVT added on top of the marginal part. */
  fixedUvt: number;
};

const ZERO_BRACKET: TaxBracket = { fromUvt: 0, toUvt: 1090, rate: 0, fixedUvt: 0 };

export const ART_241_BRACKETS: readonly TaxBracket[] = [
  ZERO_BRACKET,
  { fromUvt: 1090, toUvt: 1700, rate: 0.19, fixedUvt: 0 },
  { fromUvt: 1700, toUvt: 4100, rate: 0.28, fixedUvt: 116 },
  { fromUvt: 4100, toUvt: 8670, rate: 0.33, fixedUvt: 788 },
  { fromUvt: 8670, toUvt: 18_970, rate: 0.35, fixedUvt: 2296 },
  { fromUvt: 18_970, toUvt: 31_000, rate: 0.37, fixedUvt: 5901 },
  { fromUvt: 31_000, toUvt: null, rate: 0.39, fixedUvt: 10_352 },
];

/** Art. 241 table in force until 2016, used for dividends of 2016 and earlier (box 119). */
export const ART_241_UNTIL_2016_BRACKETS: readonly TaxBracket[] = [
  ZERO_BRACKET,
  { fromUvt: 1090, toUvt: 1700, rate: 0.19, fixedUvt: 0 },
  { fromUvt: 1700, toUvt: 4100, rate: 0.28, fixedUvt: 116 },
  { fromUvt: 4100, toUvt: null, rate: 0.33, fixedUvt: 788 },
];

export const findBracket = (
  taxableUvt: number,
  brackets: readonly TaxBracket[] = ART_241_BRACKETS,
): TaxBracket => {
  const bracket = brackets.find(
    candidate =>
      taxableUvt > candidate.fromUvt && (candidate.toUvt === null || taxableUvt <= candidate.toUvt),
  );
  return bracket ?? ZERO_BRACKET;
};

export type TableTax = {
  taxableUvt: number;
  bracket: TaxBracket;
  taxUvt: number;
  /** Tax in pesos, rounded to the nearest thousand. */
  tax: number;
};

/** Tax on a taxable net income (renta líquida gravable) using the art. 241 table. */
export const computeTableTax = (
  taxableIncome: number,
  uvtValue: number = UVT_2025,
  brackets: readonly TaxBracket[] = ART_241_BRACKETS,
): TableTax => {
  const taxableUvt = Math.max(0, pesosToUvt(taxableIncome, uvtValue));
  const bracket = findBracket(taxableUvt, brackets);
  const taxUvt = taxableUvt <= 0 ? 0 : (taxableUvt - bracket.fromUvt) * bracket.rate + bracket.fixedUvt;

  return { taxableUvt, bracket, taxUvt, tax: roundToThousand(taxUvt * uvtValue) };
};
