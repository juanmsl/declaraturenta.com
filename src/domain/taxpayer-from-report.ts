import type { ExogenousReport } from './exogenous';
import { findFilingDeadline } from './filing-calendar';
import type { TaxYearConfig } from './tax-years';
import { splitDianName } from './taxpayer';
import type { Taxpayer } from './taxpayer';

/** The taxpayer described by their own exogenous report: name and filing deadline. */
export const taxpayerFromReport = (report: ExogenousReport, year: TaxYearConfig): Taxpayer => {
  const { firstName, fullName } = splitDianName(report.holderName);
  return {
    firstName,
    fullName,
    nitLastDigits: report.documentLastDigits,
    filingDeadline: findFilingDeadline(report.documentLastDigits, year),
    isSample: false,
  };
};
