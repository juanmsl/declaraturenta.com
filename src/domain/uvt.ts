import type { TaxYearConfig } from './tax-years';

export { uvtToPesos } from './tax-years';

/** Converts pesos to UVT of the taxable year, without rounding. */
export const pesosToUvt = (pesos: number, year: TaxYearConfig): number => pesos / year.uvt;

/** Values on DIAN forms are rounded to the nearest multiple of 1.000 (art. 577 E.T.). */
export const roundToThousand = (value: number): number => Math.round(value / 1000) * 1000;
