import { createEmptyDeclaration } from '@/domain/declaration';
import {
  carriedBalanceInFavor,
  EMPTY_PREVIOUS_RETURN,
  isPreviousReturnGiven,
} from '@/domain/previous-return';
import type { PreviousReturnRecord } from '@/domain/previous-return';

import { STATE_VERSION } from './declaration-state';
import type { DeclarationState } from './declaration-state';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const withoutShouldFile = (steps: unknown): DeclarationState['completedSteps'] =>
  Array.isArray(steps)
    ? (steps.filter(step => step !== 'should-file') as DeclarationState['completedSteps'])
    : [];

/**
 * Brings a saved state from an older version to the current one, when the change only adds
 * fields. Returns null when it cannot be migrated.
 * - 7 → 8: adds the pensions, dividends and occasional gains schedules, empty (ADR 0031).
 * - 8 → 9: adds the fees (honorarios) schedule, empty (ADR 0032).
 * - 9 → 10: adds the taxable year; every earlier state is AG 2025 (ADR 0034).
 * - 10 → 11: the app starts empty (ADR 0035). A state still showing the fictional sample taxpayer
 *   is dropped; the others lose `isSample`, get `vatResponsible: false` and forget «should-file».
 * - 11 → 12: adds the new deductions, «Otros ajustes» and the filing data, empty (ADR 0038).
 * - 12 → 13: adds last year's return, not given (ADR 0048).
 */
export const migrateState = (value: unknown): DeclarationState | null => {
  if (!isRecord(value) || !isRecord(value.data)) return null;
  if (value.version === STATE_VERSION) return value as DeclarationState;
  if (value.version === 13) return toVersion14(value);
  if (value.version === 12) return toVersion13(value);
  if (value.version === 11) return toVersion12(value);
  if (typeof value.version !== 'number' || value.version < 7 || value.version > 10) return null;
  if (!isRecord(value.taxpayer) || value.taxpayer.isSample === true) return null;
  const taxpayer = { ...value.taxpayer };
  delete taxpayer.isSample;
  const data = value.data as Partial<DeclarationState['data']>;
  const obligation = (data.obligation ?? {}) as Partial<DeclarationState['data']['obligation']>;
  return toVersion12({
    ...(value as unknown as DeclarationState),
    version: 11,
    taxYear: typeof value.taxYear === 'number' ? value.taxYear : 2025,
    taxpayer: taxpayer,
    // «¿Debo declarar?» left the flow (ADR 0035).
    completedSteps: withoutShouldFile(value.completedSteps),
    visitedSteps: withoutShouldFile(value.visitedSteps),
    data: {
      ...(data as DeclarationState['data']),
      obligation: {
        creditCardPurchases: obligation.creditCardPurchases ?? 0,
        totalPurchases: obligation.totalPurchases ?? 0,
        deposits: obligation.deposits ?? 0,
        vatResponsible: obligation.vatResponsible ?? false,
      },
      pensions: data.pensions ?? { concepts: [], nonTaxableIncome: 0, months: 12 },
      dividends: data.dividends ?? { concepts: [] },
      occasionalGains: data.occasionalGains ?? { concepts: [] },
      fees: data.fees ?? { concepts: [], nonTaxableIncome: 0, costs: 0, option: null },
    },
  });
};

/** Version 12 (ADR 0038): new deductions, «Otros ajustes» and filing data start empty. */
const toVersion12 = (value: Record<string, unknown>): DeclarationState => {
  const state = value as unknown as DeclarationState;
  const empty = createEmptyDeclaration();
  const data = state.data as Partial<DeclarationState['data']>;
  return toVersion13({
    ...state,
    version: 12,
    data: {
      ...state.data,
      deductions: { ...empty.deductions, ...data.deductions },
      adjustments: data.adjustments ?? empty.adjustments,
      filing: data.filing ?? empty.filing,
    },
  });
};

/** Version 13 (ADR 0048): last year's return, not given yet. */
const toVersion13 = (value: object): DeclarationState =>
  toVersion14({ ...value, version: 13, previousReturn: { ...EMPTY_PREVIOUS_RETURN } });

/**
 * Version 14 (ADR 0050): the refund question is a switch that starts as «No», so an unanswered
 * question (null) becomes «No» and last year's balance in favor goes to box 131.
 */
const toVersion14 = (value: object): DeclarationState => {
  const state = value as Omit<DeclarationState, 'previousReturn'> & {
    previousReturn: Omit<PreviousReturnRecord, 'refundRequested'> & { refundRequested: boolean | null };
  };
  const previousReturn: PreviousReturnRecord = {
    ...state.previousReturn,
    refundRequested: state.previousReturn.refundRequested ?? false,
  };
  return {
    ...state,
    version: STATE_VERSION,
    previousReturn,
    data: isPreviousReturnGiven(previousReturn)
      ? { ...state.data, previousBalanceInFavor: carriedBalanceInFavor(previousReturn) }
      : state.data,
  };
};
