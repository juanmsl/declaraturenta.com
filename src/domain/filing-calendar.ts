import type { TaxYearConfig } from './tax-years';

/**
 * Filing deadline (ISO date) for the last two digits of the NIT, from the year's calendar (each
 * entry covers its ending and the next one; "00" closes the calendar with "99").
 */
export const findFilingDeadline = (lastTwoDigits: string, year: TaxYearConfig): string => {
  const ending = Number(lastTwoDigits.slice(-2).padStart(2, '0'));
  const value = ending === 0 ? 100 : ending;
  const entry = year.filingCalendar.find(([first]) => value === first || value === first + 1);
  return entry?.[1] ?? year.filingCalendar.at(-1)?.[1] ?? `${String(year.filingYear)}-12-31`;
};

/** First and last filing dates of the year's calendar. */
export const filingWindow = (year: TaxYearConfig): { from: string; to: string } => ({
  from: year.filingCalendar[0]?.[1] ?? '',
  to: year.filingCalendar.at(-1)?.[1] ?? '',
});
