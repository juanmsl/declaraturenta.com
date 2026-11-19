import type { IncomeConcept } from '@/domain/declaration';

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const ADJUSTMENT_ID = 'income-adjustment';

/**
 * Sets the total of an income schedule. Reported concepts are kept; the difference with what the
 * user writes becomes one adjustment concept, so the 210 detail still shows where each peso comes from.
 */
export const withTotal = <T extends { id: string; amount: number }>(
  concepts: readonly T[],
  total: number,
  adjustment: Omit<T, 'id' | 'amount'>,
): T[] => {
  const kept = concepts.filter(concept => concept.id !== ADJUSTMENT_ID);
  const difference = total - sum(kept.map(concept => concept.amount));
  return difference === 0 ? kept : [...kept, { ...adjustment, id: ADJUSTMENT_ID, amount: difference } as T];
};

/** Adjustment concept of the income screen ("Ajuste que escribiste en Ingresos"). */
export const ADJUSTMENT = {
  label: 'Ajuste que escribiste en Ingresos',
  entity: 'Lo ingresaste tú',
  origin: 'user',
} as const;

export const totalOf = (concepts: readonly { amount: number }[]) =>
  sum(concepts.map(concept => concept.amount));

export const isFromExogenous = (concepts: readonly Pick<IncomeConcept, 'origin'>[]) =>
  concepts.length > 0 && concepts.every(concept => concept.origin === 'exogenous');

export const EXOGENOUS_ORIGIN = { variant: 'exogenous', label: 'Desde exógena' } as const;

/** Ids of the "Otras cédulas" shared with the Formulario 210 screen. */
export const SCHEDULE_IDS = {
  pensions: 'pensions',
  dividends: 'dividends',
  occasionalGains: 'occasional-gains',
} as const;
