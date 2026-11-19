import type { DeclarationData } from '@/domain/declaration';
import { sampleDeclaration } from '@/mocks/sample-declaration';

import type { FlowStepId } from '../flow';

/** Everything the user has entered, plus where they are in the flow. Persisted in localStorage. */
export type DeclarationState = {
  version: typeof STATE_VERSION;
  data: DeclarationData;
  /** Steps confirmed with their primary action ("Guardar y seguir"). */
  completedSteps: FlowStepId[];
  /** Steps the user has opened at least once. */
  visitedSteps: FlowStepId[];
  exogenous: {
    /** Name of the uploaded exogenous report (simulated: content comes from sample data). */
    fileName: string | null;
    /** Exogenous items the user explicitly confirmed (e.g. housing interest). */
    confirmedItems: string[];
  };
  /** ISO timestamp of the user's last change (shown as "Guardado hace…"). */
  savedAt: string | null;
};

/** Bump when `DeclarationState` changes shape; older saved states fall back to the initial one. */
export const STATE_VERSION = 2;

export const createInitialState = (): DeclarationState => ({
  version: STATE_VERSION,
  data: structuredClone(sampleDeclaration),
  completedSteps: [],
  visitedSteps: [],
  exogenous: { fileName: null, confirmedItems: [] },
  savedAt: null,
});

export type DeclarationAction =
  | { type: 'visitStep'; step: FlowStepId }
  | { type: 'completeStep'; step: FlowStepId }
  | { type: 'updateData'; update: (data: DeclarationData) => DeclarationData }
  | { type: 'importExogenous'; fileName: string }
  | { type: 'confirmExogenousItem'; itemId: string }
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
    case 'importExogenous':
      return { ...state, exogenous: { ...state.exogenous, fileName: action.fileName }, savedAt: action.at };
    case 'confirmExogenousItem':
      return {
        ...state,
        exogenous: {
          ...state.exogenous,
          confirmedItems: addOnce(state.exogenous.confirmedItems, action.itemId),
        },
        savedAt: action.at,
      };
    case 'reset':
      return createInitialState();
  }
};
