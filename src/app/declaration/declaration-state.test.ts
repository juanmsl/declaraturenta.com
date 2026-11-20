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
    expect(state.data.withholdings).toBe(0);
  });

  it('starts empty, without the sample taxpayer', () => {
    const state = createInitialState();
    expect(state.taxpayer.fullName).toBe('');
    expect(state.taxpayer.filingDeadline).toBeNull();
    expect(state.data.labor.salaries).toBe(0);
    expect(state.exogenous.report.items).toEqual([]);
  });

  it('sets the filing deadline from the NIT digits typed by hand', () => {
    let state = declarationReducer(createInitialState(), { type: 'setNitDigits', digits: '47' });
    expect(state.taxpayer.nitLastDigits).toBe('47');
    expect(state.taxpayer.filingDeadline).toBe('2026-09-15');
    state = declarationReducer(state, { type: 'setNitDigits', digits: '' });
    expect(state.taxpayer.filingDeadline).toBeNull();
  });

  it('resets the open year to the empty state', () => {
    let state = declarationReducer(createInitialState(), { type: 'setNitDigits', digits: '47' });
    state = declarationReducer(state, { type: 'completeStep', step: 'income' });
    const reset = declarationReducer(state, { type: 'reset' });
    expect(reset).toEqual(createInitialState());
  });
});

describe('storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('round-trips the state', () => {
    const state = { ...createInitialState(), completedSteps: ['exogenous' as const] };
    saveState(state);
    expect(loadState().completedSteps).toEqual(['exogenous']);
  });

  it('falls back to the initial state on invalid data', () => {
    window.localStorage.setItem(storageKey(2025), '{not json');
    expect(loadState().completedSteps).toEqual([]);
    window.localStorage.setItem(storageKey(2025), JSON.stringify({ version: 0 }));
    expect(loadState().data.withholdings).toBe(0);
  });
});
