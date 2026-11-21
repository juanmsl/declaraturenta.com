import { useCallback, useMemo } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

import { buildContextValue } from './context-value';
import { DeclarationContext } from './declaration-context';
import { declarationReducer } from './declaration-state';
import type { DeclarationAction, DeclarationState } from './declaration-state';

type DraftDeclarationProps = {
  draft: DeclarationState;
  setDraft: Dispatch<SetStateAction<DeclarationState>>;
  children: ReactNode;
};

/**
 * Gives its children a copy of the return to edit: the sections of the steps work unchanged, and
 * nothing reaches the real return until the copy is saved (box panel of the 210, ADR 0047).
 */
export const DraftDeclaration = ({ draft, setDraft, children }: DraftDeclarationProps) => {
  const dispatch = useCallback(
    (action: DeclarationAction) => {
      setDraft(current => declarationReducer(current, { ...action, at: new Date().toISOString() }));
    },
    [setDraft],
  );
  const value = useMemo(() => buildContextValue(draft, dispatch), [draft, dispatch]);
  return <DeclarationContext value={value}>{children}</DeclarationContext>;
};
