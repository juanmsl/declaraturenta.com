import { createEmptyDeclaration } from '@/domain/declaration';
import type { IncomeConcept, ValueOrigin } from '@/domain/declaration';
import { reportedTotal } from '@/domain/exogenous';
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
 * - 13 → 14: the refund question of last year's return starts as «No» (ADR 0050).
 * - 14 → 15: boxes 60, 75, 76 and 77 become lists of concepts (ADR 0052).
 * - 15 → 16: boxes 56, 72, 89, 94, 95 and 96 become lists of concepts and leave «Otros ajustes»
 *   (ADR 0055).
 */
export const migrateState = (value: unknown): DeclarationState | null => {
  if (!isRecord(value) || !isRecord(value.data)) return null;
  if (value.version === STATE_VERSION) return value as DeclarationState;
  if (value.version === 15) return toVersion16(value);
  if (value.version === 14) return toVersion15(value);
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
  return toVersion15({
    ...state,
    version: 14,
    previousReturn,
    data: isPreviousReturnGiven(previousReturn)
      ? { ...state.data, previousBalanceInFavor: carriedBalanceInFavor(previousReturn) }
      : state.data,
  });
};

type Version14Data = Omit<DeclarationState['data'], 'capital' | 'nonLabor'> & {
  capital: Omit<DeclarationState['data']['capital'], 'costConcepts'> & { costs?: number };
  nonLabor: Pick<DeclarationState['data']['nonLabor'], 'concepts'> & {
    returns?: number;
    independentContributions?: number;
    costs?: number;
  };
};

/** One concept with the amount a box had before it became a list; none when it was zero. */
const asConcepts = (
  id: string,
  label: string,
  amount: number | undefined,
  origin: ValueOrigin,
): IncomeConcept[] => (amount && amount > 0 ? [{ id, label, entity: '', amount, origin }] : []);

/**
 * Version 15 (ADR 0052): boxes 60, 75, 76 and 77 are lists of concepts. Each amount becomes one
 * concept; box 76 keeps the exogenous origin when it still matches the report.
 */
const toVersion15 = (value: object): DeclarationState => {
  const state = value as Omit<DeclarationState, 'data'> & { data: Version14Data };
  const { capital, nonLabor } = state.data;
  const { costs: capitalCosts, ...capitalRest } = capital;
  const { returns, independentContributions, costs, ...nonLaborRest } = nonLabor;
  const reported = reportedTotal(state.exogenous.report, 'other-non-taxable');
  return toVersion16({
    ...state,
    version: 15,
    data: {
      ...state.data,
      capital: {
        ...capitalRest,
        costConcepts: asConcepts('capital-costs', 'Costos y gastos', capitalCosts, 'user'),
      },
      nonLabor: {
        ...nonLaborRest,
        returnConcepts: asConcepts(
          'non-labor-returns',
          'Devoluciones, rebajas y descuentos',
          returns,
          'user',
        ),
        contributionConcepts: asConcepts(
          'non-labor-contributions',
          'Aportes obligatorios a pensión',
          independentContributions,
          independentContributions === reported ? 'exogenous' : 'user',
        ),
        costConcepts: asConcepts('non-labor-costs', 'Costos y gastos', costs, 'user'),
      },
    },
  });
};

type Version15Adjustments = Omit<
  DeclarationState['data']['adjustments'],
  'losses' | 'presumptiveExcessConcepts' | 'taxableAdditionConcepts' | 'enabled'
> & {
  enabled: string[];
  losses: Record<'fees' | 'capital' | 'nonLabor' | 'until2018', number | IncomeConcept[]>;
  presumptiveExcess?: number;
  taxableAdditions?: number;
  presumptiveExcessConcepts?: IncomeConcept[];
  taxableAdditionConcepts?: IncomeConcept[];
};

/** Removed «Otros ajustes» switches (ADR 0055). */
const REMOVED_SWITCHES = ['losses', 'presumptive-excess', 'taxable-additions'];

/**
 * Version 16 (ADR 0055): boxes 56, 72, 89, 94, 95 and 96 are lists of concepts filled in the 210,
 * without a switch. Each amount whose switch was on becomes one concept; amounts behind a switch
 * that was off did not count, so they are dropped.
 */
const toVersion16 = (value: object): DeclarationState => {
  const state = value as Omit<DeclarationState, 'data'> & {
    data: Omit<DeclarationState['data'], 'adjustments'> & { adjustments: Version15Adjustments };
  };
  const { enabled, losses, presumptiveExcess, taxableAdditions, ...rest } = state.data.adjustments;
  const on = (id: string) => enabled.includes(id);
  const lossConcepts = (column: keyof typeof losses, label: string): IncomeConcept[] => {
    const current = losses[column];
    if (Array.isArray(current)) return current;
    return on('losses') ? asConcepts(`losses-${column}`, label, current, 'user') : [];
  };
  return {
    ...state,
    version: STATE_VERSION,
    data: {
      ...state.data,
      adjustments: {
        ...rest,
        enabled: enabled.filter(
          id => !REMOVED_SWITCHES.includes(id),
        ) as DeclarationState['data']['adjustments']['enabled'],
        losses: {
          fees: lossConcepts('fees', 'Pérdidas de años anteriores'),
          capital: lossConcepts('capital', 'Pérdidas de años anteriores'),
          nonLabor: lossConcepts('nonLabor', 'Pérdidas de años anteriores'),
          until2018: lossConcepts('until2018', 'Pérdidas de 2018 y antes'),
        },
        presumptiveExcessConcepts:
          rest.presumptiveExcessConcepts ??
          (on('presumptive-excess')
            ? asConcepts('presumptive-excess', 'Exceso de renta presuntiva', presumptiveExcess, 'user')
            : []),
        taxableAdditionConcepts:
          rest.taxableAdditionConcepts ??
          (on('taxable-additions')
            ? asConcepts('taxable-additions', 'Rentas gravables', taxableAdditions, 'user')
            : []),
      },
    },
  };
};
