import type { TaxBracket, TaxYearConfig } from './tax-years';
import { pesosToUvt, roundToThousand } from './uvt';

export type { TaxBracket } from './tax-years';

const ZERO_BRACKET: TaxBracket = { fromUvt: 0, toUvt: 0, rate: 0, fixedUvt: 0 };

export const findBracket = (taxableUvt: number, brackets: readonly TaxBracket[]): TaxBracket => {
  const bracket = brackets.find(
    candidate =>
      taxableUvt > candidate.fromUvt && (candidate.toUvt === null || taxableUvt <= candidate.toUvt),
  );
  return bracket ?? brackets[0] ?? ZERO_BRACKET;
};

export type TableTax = {
  taxableUvt: number;
  bracket: TaxBracket;
  taxUvt: number;
  /** Tax in pesos, rounded to the nearest thousand. */
  tax: number;
};

/** Tax on a taxable net income with a table of the year (art. 241 by default). */
export const computeTableTax = (
  taxableIncome: number,
  year: TaxYearConfig,
  brackets: readonly TaxBracket[] = year.incomeTaxBrackets,
): TableTax => {
  const taxableUvt = Math.max(0, pesosToUvt(taxableIncome, year));
  const bracket = findBracket(taxableUvt, brackets);
  const taxUvt = taxableUvt <= 0 ? 0 : (taxableUvt - bracket.fromUvt) * bracket.rate + bracket.fixedUvt;

  return { taxableUvt, bracket, taxUvt, tax: roundToThousand(taxUvt * year.uvt) };
};
