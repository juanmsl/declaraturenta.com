import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';

import { computeDeclaration } from '@/domain/declaration';

import { DeclarationContext } from './declaration-context';
import { declarationReducer } from './declaration-state';
import type { DeclarationAction, DeclarationState } from './declaration-state';
import { loadState, saveState } from './storage';

type DeclarationProviderProps = {
  children: ReactNode;
  /** Initial state for tests. Defaults to what is saved in localStorage. */
  initialState?: DeclarationState;
};

/** Holds the return in React state and saves every change to localStorage. */
export const DeclarationProvider = ({ children, initialState }: DeclarationProviderProps) => {
  const [state, rawDispatch] = useReducer(declarationReducer, initialState, init => init ?? loadState());

  const dispatch = useCallback((action: DeclarationAction) => {
    rawDispatch({ ...action, at: new Date().toISOString() });
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo(() => {
    const includeDeductions = state.visitedSteps.includes('deductions');
    return {
      state,
      dispatch,
      result: computeDeclaration(state.data),
      estimate: computeDeclaration(state.data, { includeDeductions }),
    };
  }, [state, dispatch]);

  return <DeclarationContext value={value}>{children}</DeclarationContext>;
};
