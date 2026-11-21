/**
 * Reader of last year's Formulario 210, as the DIAN PDF prints it (ADR 0048). The PDF only has the
 * values as text (the box labels are drawings), always in the same place, so each box is found by
 * its position on the page. Pure: the browser extracts the text elsewhere.
 */

import type { DeclarationData } from './declaration';

/** A piece of text of the page, in PDF points from the top-left corner. */
export type PageText = {
  text: string;
  /** Left edge. */
  x: number;
  /** Right edge. */
  right: number;
  /** Baseline, measured from the top of the page. */
  baseline: number;
};

/** The four values taken from last year's return. */
export type PreviousReturnValues = {
  /** Box 31: total patrimonio líquido. */
  netAssets: number;
  /** Box 126: impuesto neto de renta. */
  netTax: number;
  /** Box 133: anticipo renta para el año gravable siguiente (this year's box 130). */
  advance: number;
  /** Box 137: total saldo a favor (this year's box 131 when no refund was asked). */
  balanceInFavor: number;
};

export type PreviousReturn = { year: number; values: PreviousReturnValues };

export class PreviousReturnError extends Error {
  readonly reason = 'not-a-return';
}

/** Size of the DIAN page (US letter), in points. */
const PAGE = { width: 612, height: 792 };
/** Right column of the form, where the four values end. */
const VALUE_RIGHT = 590;
const TOLERANCE = 3;

/** Baseline of each value, from the top of the page (Formulario 210, AG 2023 and later). */
const BOX_BASELINES: Record<keyof PreviousReturnValues, number> = {
  netAssets: 198.5,
  netTax: 546.5,
  advance: 630.5,
  balanceInFavor: 654.5,
};

/** «1. Año»: four digits, one per cell, at the top left. */
const YEAR = { baseline: 69.5, left: 60, right: 110 };

const near = (value: number, target: number) => Math.abs(value - target) <= TOLERANCE;

const amount = (text: string): number | null => {
  const clean = text.trim();
  if (!/^\d{1,3}([.,]\d{3})*$/u.test(clean)) return null;
  return Number(clean.replace(/[.,]/gu, ''));
};

/** Finds the four values and the year of a 210 printed by the DIAN; throws when it is not one. */
export const parsePreviousReturn = (
  texts: readonly PageText[],
  page: { width: number; height: number },
): PreviousReturn => {
  const scaleX = PAGE.width / page.width;
  const scaleY = PAGE.height / page.height;
  const items = texts.map(item => ({
    text: item.text,
    x: item.x * scaleX,
    right: item.right * scaleX,
    baseline: item.baseline * scaleY,
  }));

  const yearDigits = items
    .filter(item => near(item.baseline, YEAR.baseline) && item.x >= YEAR.left && item.right <= YEAR.right)
    .sort((a, b) => a.x - b.x)
    .map(item => item.text.trim())
    .join('');
  const year = /^\d{4}$/u.test(yearDigits) ? Number(yearDigits) : null;

  const valueAt = (baseline: number): number | null => {
    const found = items.find(item => near(item.baseline, baseline) && near(item.right, VALUE_RIGHT));
    return found ? amount(found.text) : null;
  };

  const netAssets = valueAt(BOX_BASELINES.netAssets);
  const netTax = valueAt(BOX_BASELINES.netTax);
  const advance = valueAt(BOX_BASELINES.advance);
  const balanceInFavor = valueAt(BOX_BASELINES.balanceInFavor);

  if (year === null || netAssets === null || netTax === null || advance === null || balanceInFavor === null) {
    throw new PreviousReturnError('No es un formulario 210 de la DIAN');
  }
  return { year, values: { netAssets, netTax, advance, balanceInFavor } };
};

/** What the person gave of last year's return, kept with the state (ADR 0048). */
export type PreviousReturnRecord = {
  /** Name of the PDF read; null when the values were typed or not given. */
  fileName: string | null;
  /** The person chose to type the values without a PDF. */
  manual: boolean;
  /** Values as read from the PDF, to mark the ones not changed since. */
  read: PreviousReturnValues | null;
  /** Box 137 of last year. */
  balanceInFavor: number;
  /** Whether that balance was asked back (refund or compensation). Starts as «No» (ADR 0050). */
  refundRequested: boolean;
};

export const EMPTY_PREVIOUS_RETURN: PreviousReturnRecord = {
  fileName: null,
  manual: false,
  read: null,
  balanceInFavor: 0,
  refundRequested: false,
};

export const isPreviousReturnGiven = (record: PreviousReturnRecord): boolean =>
  record.fileName !== null || record.manual;

/** This year's box 131: last year's balance in favor, only when it was not asked back. */
export const carriedBalanceInFavor = (record: PreviousReturnRecord): number =>
  record.refundRequested ? 0 : record.balanceInFavor;

/**
 * Takes last year's values into this return: net tax for the advance (and it is no longer the
 * first return), the advance paid for this year (box 130) and the net assets for late filing.
 */
export const applyPreviousReturnValues = (
  data: DeclarationData,
  values: PreviousReturnValues,
): DeclarationData => ({
  ...data,
  general: {
    ...data.general,
    previousYearNetTax: values.netTax,
    filingCount: data.general.filingCount === 'first' ? 'second' : data.general.filingCount,
  },
  previousYearAdvance: values.advance,
  filing: { ...data.filing, previousNetAssets: values.netAssets },
});
