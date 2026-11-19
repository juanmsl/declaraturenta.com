/**
 * DIAN filing calendar for personas naturales, income tax of taxable year 2025 (filed in 2026),
 * by the last two digits of the NIT without the verification digit (calendario tributario 2026,
 * Decreto 2229 de 2023). Each entry covers two endings: [first ending, ISO date].
 */
const CALENDAR_2026: readonly (readonly [number, string])[] = [
  [1, '2026-08-12'],
  [3, '2026-08-13'],
  [5, '2026-08-14'],
  [7, '2026-08-18'],
  [9, '2026-08-19'],
  [11, '2026-08-20'],
  [13, '2026-08-21'],
  [15, '2026-08-24'],
  [17, '2026-08-25'],
  [19, '2026-08-26'],
  [21, '2026-08-27'],
  [23, '2026-08-28'],
  [25, '2026-08-31'],
  [27, '2026-09-01'],
  [29, '2026-09-02'],
  [31, '2026-09-03'],
  [33, '2026-09-04'],
  [35, '2026-09-07'],
  [37, '2026-09-08'],
  [39, '2026-09-09'],
  [41, '2026-09-10'],
  [43, '2026-09-11'],
  [45, '2026-09-14'],
  [47, '2026-09-15'],
  [49, '2026-09-16'],
  [51, '2026-09-17'],
  [53, '2026-09-18'],
  [55, '2026-09-21'],
  [57, '2026-09-22'],
  [59, '2026-09-23'],
  [61, '2026-09-24'],
  [63, '2026-09-25'],
  [65, '2026-09-28'],
  [67, '2026-10-01'],
  [69, '2026-10-02'],
  [71, '2026-10-05'],
  [73, '2026-10-06'],
  [75, '2026-10-07'],
  [77, '2026-10-08'],
  [79, '2026-10-09'],
  [81, '2026-10-13'],
  [83, '2026-10-14'],
  [85, '2026-10-15'],
  [87, '2026-10-16'],
  [89, '2026-10-19'],
  [91, '2026-10-20'],
  [93, '2026-10-21'],
  [95, '2026-10-22'],
  [97, '2026-10-23'],
  [99, '2026-10-26'],
];

/** Filing deadline (ISO date) for the last two digits of the NIT, e.g. "47" → 2026-09-15. */
export const findFilingDeadline = (lastTwoDigits: string): string => {
  const ending = Number(lastTwoDigits.slice(-2).padStart(2, '0'));
  // "00" closes the calendar together with "99".
  const value = ending === 0 ? 100 : ending;
  const entry = CALENDAR_2026.find(([first]) => value === first || value === first + 1);
  return entry?.[1] ?? '2026-10-26';
};
