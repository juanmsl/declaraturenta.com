/**
 * Reader of the DIAN "Consulta de información reportada por terceros" spreadsheet (información
 * exógena), already turned into rows of cells. Pure: the browser reads the .xlsx elsewhere.
 * ADR 0024.
 */

/** Cells as the spreadsheet reader returns them (strings, numbers, dates, empty). */
export type SheetRows = readonly (readonly unknown[])[];

/** One value a third party reported, as written in the file. */
export type ExogenousLine = {
  /** Stable id inside the file (row number). */
  id: string;
  reporterNit: string;
  reporterName: string;
  /** "Detalle" column, e.g. "Pagos por salarios (Concepto: 2276)". */
  detail: string;
  amount: number;
  /** "Uso declaración Sugerida" column, e.g. "R132 Retenciones año gravable a declarar". */
  suggestedUse: string;
  /** "Información adicional" column (account type, plate, contribution type…). */
  extra: string;
};

export type ExogenousFile = {
  /** Taxable year the report refers to ("Año al que se refiere la consulta"). */
  year: number | null;
  holder: { documentType: string; documentNumber: string; name: string };
  /** The DIAN's own sums for the five filing tests ("Tope 1" to "Tope 5"). */
  thresholds: { income: number; assets: number; cardSpending: number; deposits: number; purchases: number };
  lines: ExogenousLine[];
};

export class ExogenousFileError extends Error {
  readonly reason: 'not-exogenous' | 'no-lines';

  constructor(reason: 'not-exogenous' | 'no-lines') {
    super(reason);
    this.name = 'ExogenousFileError';
    this.reason = reason;
  }
}

const text = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value.replace(/\s+/gu, ' ').trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
};

const amount = (value: unknown): number => {
  if (typeof value === 'number') return value;
  const normalized = text(value)
    .replace(/[$\s.]/gu, '')
    .replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** NITs come as numbers (860034594) or strings; keep digits only, without decimals. */
const nit = (value: unknown): string =>
  typeof value === 'number' ? String(Math.trunc(value)) : text(value).replace(/\D/gu, '');

const findLabelValue = (rows: SheetRows, label: string): string => {
  for (const row of rows) {
    const index = row.findIndex(cell => text(cell).toLowerCase().startsWith(label));
    if (index < 0) continue;
    const value = text(row.slice(index + 1).find(cell => text(cell) !== ''));
    if (value) return value;
  }
  return '';
};

const THRESHOLD_KEYS = {
  1: 'income',
  2: 'assets',
  3: 'cardSpending',
  4: 'deposits',
  5: 'purchases',
} as const satisfies Record<number, keyof ExogenousFile['thresholds']>;

/** Reads the rows of the first sheet. Throws `ExogenousFileError` when it is not that report. */
export const parseExogenousSheet = (rows: SheetRows): ExogenousFile => {
  const headerIndex = rows.findIndex(row => {
    const cells = row.map(cell => text(cell).toLowerCase());
    return (
      cells.includes('detalle') &&
      cells.includes('valor') &&
      cells.some(cell => cell.startsWith('uso declaraci'))
    );
  });
  if (headerIndex < 0) throw new ExogenousFileError('not-exogenous');

  const header = (rows[headerIndex] ?? []).map(cell => text(cell).toLowerCase());
  const column = {
    reporterNit: header.indexOf('nit'),
    reporterName: header.findIndex(cell => cell.startsWith('nombre')),
    detail: header.indexOf('detalle'),
    amount: header.indexOf('valor'),
    use: header.findIndex(cell => cell.startsWith('uso declaraci')),
    extra: header.findIndex(cell => cell.startsWith('información') || cell.startsWith('informacion')),
  };

  const meta = rows.slice(0, headerIndex);
  const yearText = findLabelValue(meta, 'año al que se refiere');
  const thresholds: ExogenousFile['thresholds'] = {
    income: 0,
    assets: 0,
    cardSpending: 0,
    deposits: 0,
    purchases: 0,
  };
  const lines: ExogenousLine[] = [];

  rows.slice(headerIndex + 1).forEach((row, offset) => {
    const detail = text(row[column.detail]);
    if (!detail) return;
    const value = amount(row[column.amount]);
    const reporterNit = nit(row[column.reporterNit]);
    const threshold = /^tope\s*(\d)/iu.exec(detail);
    if (!reporterNit && threshold) {
      const key = THRESHOLD_KEYS[Number(threshold[1]) as keyof typeof THRESHOLD_KEYS] as
        keyof ExogenousFile['thresholds'] | undefined;
      if (key) thresholds[key] = value;
      return;
    }
    if (!reporterNit) return;
    lines.push({
      id: `row-${String(headerIndex + offset + 2)}`,
      reporterNit,
      reporterName: text(row[column.reporterName]),
      detail,
      amount: value,
      suggestedUse: text(row[column.use]),
      extra: column.extra >= 0 ? text(row[column.extra]) : '',
    });
  });

  if (lines.length === 0) throw new ExogenousFileError('no-lines');

  return {
    year: /^\d{4}$/u.test(yearText) ? Number(yearText) : null,
    holder: {
      documentType: findLabelValue(meta, 'tipo de documento'),
      documentNumber: findLabelValue(meta, 'identificación:').replace(/\D/gu, ''),
      name: findLabelValue(meta, 'nombres'),
    },
    thresholds,
    lines,
  };
};
