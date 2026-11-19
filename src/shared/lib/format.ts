/** Locale for every user-facing format: Spanish (Colombia). */
export const LOCALE = 'es-CO';

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'COP',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Formats Colombian pesos as `$ 1.234.567` (narrow no-break space after the sign,
 * dots as thousands separators, no decimals), as defined in the product voice.
 */
export const formatCurrency = (value: number): string =>
  currencyFormatter.format(value).replace(/^(-?)\$\s*/u, '$1$ ');

const longDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Bogota',
});

/** Formats an ISO date (`2026-09-15`) as `15 de septiembre de 2026`. */
export const formatLongDate = (isoDate: string): string =>
  longDateFormatter.format(new Date(`${isoDate}T12:00:00-05:00`));

const relativeTimeFormatter = new Intl.RelativeTimeFormat(LOCALE, { style: 'short', numeric: 'auto' });

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400],
  ['hour', 3600],
  ['minute', 60],
];

/** Formats how long ago something happened: `ahora`, `hace 1 min`, `hace 2 h`, `ayer`. */
export const formatTimeAgo = (date: Date, now: Date = new Date()): string => {
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (seconds >= unitSeconds) return relativeTimeFormatter.format(-Math.floor(seconds / unitSeconds), unit);
  }
  return relativeTimeFormatter.format(0, 'second');
};
