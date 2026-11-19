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
