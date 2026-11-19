import { createEmptyDeclaration } from '@/domain/declaration';
import type { DeclarationData } from '@/domain/declaration';
import { applyExogenous } from '@/domain/exogenous';
import type { ExogenousReport } from '@/domain/exogenous';
import type { Taxpayer } from '@/domain/taxpayer';
import { taxpayerFromReport } from '@/domain/taxpayer-from-report';
import { sampleDeclaration } from '@/mocks/sample-declaration';
import { sampleExogenous } from '@/mocks/sample-exogenous';
import { sampleTaxpayer } from '@/mocks/sample-taxpayer';

import type { FlowStepId } from '../flow';

/** Everything the user has entered, plus where they are in the flow. Persisted in localStorage. */
export type DeclarationState = {
  version: typeof STATE_VERSION;
  data: DeclarationData;
  /** Who is declaring. The fictional sample taxpayer until a real exogenous report is imported. */
  taxpayer: Taxpayer;
  /** Steps confirmed with their primary action ("Guardar y seguir"). */
  completedSteps: FlowStepId[];
  /** Steps the user has opened at least once. */
  visitedSteps: FlowStepId[];
  exogenous: {
    /** Name of the imported exogenous file; null while showing the sample data. */
    fileName: string | null;
    /** What the report says, classified (ADR 0024). The sample report until a file is imported. */
    report: ExogenousReport;
    /** Exogenous items the user explicitly confirmed (e.g. housing interest). */
    confirmedItems: string[];
  };
  /** "Otras cédulas" the user turned on (not calculated yet; ADR 0020). */
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
export const STATE_VERSION = 9;

export const createInitialState = (): DeclarationState => ({
  version: STATE_VERSION,
  data: structuredClone(sampleDeclaration),
  taxpayer: { ...sampleTaxpayer },
  completedSteps: [],
  visitedSteps: [],
  exogenous: { fileName: null, confirmedItems: [], report: structuredClone(sampleExogenous) },
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
      // The first real report replaces the sample data; later ones keep what the user entered.
      const base = state.taxpayer.isSample ? createEmptyDeclaration() : state.data;
      return {
        ...state,
        data: applyExogenous(base, action.report),
        taxpayer: taxpayerFromReport(action.report),
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
      return createInitialState();
  }
};
