import { createEmptyDeclaration } from '@/domain/declaration';
import type { DeclarationData } from '@/domain/declaration';
import { applyExogenous, createEmptyExogenousReport } from '@/domain/exogenous';
import type { ExogenousReport } from '@/domain/exogenous';
import { DEFAULT_TAX_YEAR, getTaxYear } from '@/domain/tax-years';
import type { TaxYearConfig } from '@/domain/tax-years';
import { EMPTY_TAXPAYER } from '@/domain/taxpayer';
import type { Taxpayer } from '@/domain/taxpayer';
import { taxpayerFromReport, withNitDigits } from '@/domain/taxpayer-from-report';

import type { FlowStepId } from '../flow';

/** Everything the user has entered, plus where they are in the flow. Persisted in localStorage. */
export type DeclarationState = {
  version: typeof STATE_VERSION;
  /** Taxable year of this return; each year is saved apart (ADR 0034). */
  taxYear: number;
  data: DeclarationData;
  /** Who is declaring: empty until the exogenous report is imported or the NIT digits are typed. */
  taxpayer: Taxpayer;
  /** Steps confirmed with their primary action ("Guardar y seguir"). */
  completedSteps: FlowStepId[];
  /** Steps the user has opened at least once. */
  visitedSteps: FlowStepId[];
  exogenous: {
    /** Name of the imported exogenous file; null until one is imported. */
    fileName: string | null;
    /** What the report says, classified (ADR 0024). Empty until a file is imported. */
    report: ExogenousReport;
    /** Exogenous items the user explicitly confirmed (e.g. housing interest). */
    confirmedItems: string[];
  };
  /** "Otras cédulas" the user turned on: pensions, dividends, occasional-gains (ADR 0031). */
  activeSchedules: string[];
  /** The user closed the "¿Primera vez aquí?" card in Inicio (ADR 0028). */
  helpIntroDismissed: boolean;
  /** ISO timestamp of the user's last change (shown as "Guardado hace…"). */
  savedAt: string | null;
};

/**
 * Bump when `DeclarationState` changes shape and add the step to `migrateState`; states that cannot
 * be migrated fall back to the initial one.
 */
export const STATE_VERSION = 12;

/** A new, empty return for a year (ADR 0035). */
export const createInitialState = (year: TaxYearConfig = getTaxYear(DEFAULT_TAX_YEAR)): DeclarationState => ({
  version: STATE_VERSION,
  taxYear: year.year,
  data: createEmptyDeclaration(),
  taxpayer: { ...EMPTY_TAXPAYER },
  completedSteps: [],
  visitedSteps: [],
  exogenous: { fileName: null, confirmedItems: [], report: createEmptyExogenousReport() },
  activeSchedules: [],
  helpIntroDismissed: false,
  savedAt: null,
});

export type DeclarationAction =
  | { type: 'visitStep'; step: FlowStepId }
  | { type: 'completeStep'; step: FlowStepId }
  | { type: 'updateData'; update: (data: DeclarationData) => DeclarationData }
  | { type: 'importExogenous'; report: ExogenousReport }
  | { type: 'confirmExogenousItem'; itemId: string }
  | { type: 'setNitDigits'; digits: string }
  | { type: 'toggleSchedule'; scheduleId: string }
  | { type: 'dismissHelpIntro' }
  | { type: 'restore'; state: DeclarationState }
  | { type: 'reset' };

/** An action stamped with the time it was dispatched, so the reducer stays pure. */
export type TimedAction = DeclarationAction & { at: string };

const addOnce = <T>(list: readonly T[], item: T): T[] => (list.includes(item) ? [...list] : [...list, item]);

export const declarationReducer = (state: DeclarationState, action: TimedAction): DeclarationState => {
  switch (action.type) {
    case 'visitStep':
      // Navigation is saved but does not count as a change for "Guardado hace…".
      if (state.visitedSteps.includes(action.step)) return state;
      return { ...state, visitedSteps: addOnce(state.visitedSteps, action.step) };
    case 'completeStep':
      return { ...state, completedSteps: addOnce(state.completedSteps, action.step), savedAt: action.at };
    case 'updateData':
      return { ...state, data: action.update(state.data), savedAt: action.at };
    case 'importExogenous': {
      // The report fills its values and keeps what the user entered by hand.
      const year = getTaxYear(state.taxYear);
      const data = applyExogenous(state.data, action.report, year);
      const withData = [
        data.pensions.concepts.length > 0 ? 'pensions' : null,
        data.dividends.concepts.length > 0 ? 'dividends' : null,
        data.occasionalGains.concepts.length > 0 ? 'occasional-gains' : null,
      ].filter(id => id !== null);
      return {
        ...state,
        activeSchedules: [...new Set([...state.activeSchedules, ...withData])],
        data,
        taxpayer: taxpayerFromReport(action.report, year),
        exogenous: { fileName: action.report.fileName, confirmedItems: [], report: action.report },
        savedAt: action.at,
      };
    }
    case 'confirmExogenousItem':
      return {
        ...state,
        exogenous: {
          ...state.exogenous,
          confirmedItems: addOnce(state.exogenous.confirmedItems, action.itemId),
        },
        savedAt: action.at,
      };
    case 'setNitDigits':
      return {
        ...state,
        taxpayer: withNitDigits(state.taxpayer, action.digits, getTaxYear(state.taxYear)),
        savedAt: action.at,
      };
    case 'toggleSchedule':
      return {
        ...state,
        activeSchedules: state.activeSchedules.includes(action.scheduleId)
          ? state.activeSchedules.filter(id => id !== action.scheduleId)
          : [...state.activeSchedules, action.scheduleId],
        savedAt: action.at,
      };
    case 'dismissHelpIntro':
      return { ...state, helpIntroDismissed: true };
    case 'restore':
      return { ...action.state, savedAt: action.at };
    case 'reset':
      return createInitialState(getTaxYear(state.taxYear));
  }
};

/**
 * The data that goes into the calculation: schedules the user turned off, and fees when they said
 * they had no independent income, count as empty. Their values stay saved in case they turn them on.
 */
export const effectiveData = (state: DeclarationState): DeclarationData => {
  const { data, activeSchedules } = state;
  return {
    ...data,
    fees: data.labor.hasIndependentIncome ? data.fees : { ...data.fees, concepts: [] },
    pensions: activeSchedules.includes('pensions') ? data.pensions : { ...data.pensions, concepts: [] },
    dividends: activeSchedules.includes('dividends') ? data.dividends : { concepts: [] },
    occasionalGains: activeSchedules.includes('occasional-gains') ? data.occasionalGains : { concepts: [] },
  };
};
