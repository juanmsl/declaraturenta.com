import { AG_2025 } from './ag-2025';
import type { TaxYearConfig } from './tax-year';

export { AG_2025 } from './ag-2025';
export * from './tax-year';

/** Taxable years the platform can prepare, newest first. */
export const TAX_YEARS: readonly TaxYearConfig[] = [AG_2025];

/** Year opened when there is no saved choice. */
export const DEFAULT_TAX_YEAR = AG_2025.year;

export const findTaxYear = (year: number): TaxYearConfig | undefined =>
  TAX_YEARS.find(config => config.year === year);

/** The configuration of a year, falling back to the default year. */
export const getTaxYear = (year: number): TaxYearConfig => findTaxYear(year) ?? AG_2025;
