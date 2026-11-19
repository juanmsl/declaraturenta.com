import { roundToThousand } from './uvt';

/** How many times the taxpayer has filed income tax, including this return. */
export type FilingCount = 'first' | 'second' | 'third-or-more';

/** Share of the tax used for next year's advance payment (art. 807 E.T.). */
export const ADVANCE_RATES: Record<FilingCount, number> = {
  first: 0.25,
  second: 0.5,
  'third-or-more': 0.75,
};

export type AdvancePaymentInput = {
  filingCount: FilingCount;
  /** Impuesto neto de renta of this return. */
  currentNetTax: number;
  /** Impuesto neto de renta of the previous year's return. */
  previousNetTax: number;
  /** Withholdings of the taxable year. */
  withholdings: number;
};

export type AdvancePayment = {
  rate: number;
  /** Procedure 1: average of the last two years' net tax. Not available on the first return. */
  averageMethod: number | null;
  /** Procedure 2: this year's net tax. */
  currentMethod: number;
  /** The lower of the available procedures, never negative, rounded to thousands. */
  amount: number;
};

/** Advance payment for the next taxable year (anticipo, art. 807 E.T.). */
export const computeAdvancePayment = (input: AdvancePaymentInput): AdvancePayment => {
  const rate = ADVANCE_RATES[input.filingCount];
  const currentMethod = input.currentNetTax * rate - input.withholdings;
  const averageMethod =
    input.filingCount === 'first'
      ? null
      : ((input.currentNetTax + input.previousNetTax) / 2) * rate - input.withholdings;
  const lowest = averageMethod === null ? currentMethod : Math.min(averageMethod, currentMethod);

  return { rate, averageMethod, currentMethod, amount: roundToThousand(Math.max(0, lowest)) };
};
