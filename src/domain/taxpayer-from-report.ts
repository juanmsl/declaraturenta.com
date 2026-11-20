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
  };
};

/** The taxpayer with the last two digits of the NIT typed by hand; an empty value clears them. */
export const withNitDigits = (taxpayer: Taxpayer, digits: string, year: TaxYearConfig): Taxpayer => {
  const clean = digits.replace(/\D/gu, '').slice(0, 2);
  if (clean.length < 2) return { ...taxpayer, nitLastDigits: null, filingDeadline: null };
  return { ...taxpayer, nitLastDigits: clean, filingDeadline: findFilingDeadline(clean, year) };
};
