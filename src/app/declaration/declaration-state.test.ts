import { createInitialState, declarationReducer as reduce } from './declaration-state';
import type { DeclarationAction, DeclarationState } from './declaration-state';
import { loadState, saveState, storageKey } from './storage';

const AT = '2026-11-19T05:00:00.000Z';
const declarationReducer = (state: DeclarationState, action: DeclarationAction) =>
  reduce(state, { ...action, at: AT });

describe('declarationReducer', () => {
  it('records visited and completed steps once', () => {
    let state = createInitialState();
    state = declarationReducer(state, { type: 'visitStep', step: 'income' });
    state = declarationReducer(state, { type: 'visitStep', step: 'income' });
    state = declarationReducer(state, { type: 'completeStep', step: 'income' });
    expect(state.visitedSteps).toEqual(['income']);
    expect(state.completedSteps).toEqual(['income']);
  });

  it('updates data immutably', () => {
    const state = createInitialState();
    const next = declarationReducer(state, {
      type: 'updateData',
      update: data => ({ ...data, withholdings: 1 }),
    });
    expect(next.data.withholdings).toBe(1);
    expect(next.savedAt).toBe(AT);
    expect(state.data.withholdings).toBe(11_240_000);
  });
});

describe('storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('round-trips the state', () => {
    const state = { ...createInitialState(), completedSteps: ['should-file' as const] };
    saveState(state);
    expect(loadState().completedSteps).toEqual(['should-file']);
  });

  it('falls back to the initial state on invalid data', () => {
    window.localStorage.setItem(storageKey(2025), '{not json');
    expect(loadState().completedSteps).toEqual([]);
    window.localStorage.setItem(storageKey(2025), JSON.stringify({ version: 0 }));
    expect(loadState().data.withholdings).toBe(11_240_000);
  });
});
