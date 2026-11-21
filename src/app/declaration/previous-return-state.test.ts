import { sampleExogenous } from '@/mocks/sample-exogenous';

import { createInitialState, declarationReducer as reduce } from './declaration-state';
import type { DeclarationAction, DeclarationState } from './declaration-state';
import { migrateState } from './migrate-state';

const AT = '2026-11-21T05:00:00.000Z';
const declarationReducer = (state: DeclarationState, action: DeclarationAction) =>
  reduce(state, { ...action, at: AT });

/** Fictional values of last year's return (Laura Gómez, AG 2024). */
const values = { netAssets: 195_000_000, netTax: 7_500_000, advance: 2_100_000, balanceInFavor: 1_200_000 };

const imported = () =>
  declarationReducer(
    {
      ...createInitialState(),
      data: {
        ...createInitialState().data,
        general: { ...createInitialState().data.general, filingCount: 'first' },
      },
    },
    { type: 'importPreviousReturn', fileName: 'declaracion-2024.pdf', values },
  );

describe("last year's return", () => {
  it('fills box 130, the advance base and the net assets, and it is no longer the first return', () => {
    const { data, previousReturn } = imported();
    expect(data.previousYearAdvance).toBe(2_100_000);
    expect(data.general.previousYearNetTax).toBe(7_500_000);
    expect(data.general.filingCount).toBe('second');
    expect(data.filing.previousNetAssets).toBe(195_000_000);
    expect(previousReturn).toMatchObject({ fileName: 'declaracion-2024.pdf', refundRequested: false });
  });

  it('carries the balance in favor to box 131 unless a refund was asked', () => {
    let state = imported();
    expect(state.data.previousBalanceInFavor).toBe(1_200_000);
    state = declarationReducer(state, { type: 'updatePreviousReturn', patch: { refundRequested: true } });
    expect(state.data.previousBalanceInFavor).toBe(0);
  });

  it('keeps its box 131 when the exogenous report is imported afterwards', () => {
    let state = declarationReducer(imported(), {
      type: 'updatePreviousReturn',
      patch: { refundRequested: false },
    });
    state = declarationReducer(state, { type: 'importExogenous', report: sampleExogenous });
    expect(state.data.previousBalanceInFavor).toBe(1_200_000);
  });

  it('clears what it filled when removed', () => {
    const state = declarationReducer(imported(), { type: 'clearPreviousReturn' });
    expect(state.previousReturn.fileName).toBeNull();
    expect(state.data.previousYearAdvance).toBe(0);
    expect(state.data.general.previousYearNetTax).toBe(0);
    expect(state.data.filing.previousNetAssets).toBe(0);
  });

  it('is added, not given, to a version 12 state', () => {
    const old: Record<string, unknown> = { ...createInitialState(), version: 12 };
    delete old.previousReturn;
    expect(migrateState(old)?.previousReturn).toEqual({
      fileName: null,
      manual: false,
      read: null,
      balanceInFavor: 0,
      refundRequested: false,
    });
  });

  it('turns an unanswered refund question of a version 13 state into «No»', () => {
    const v13 = imported();
    const old = {
      ...v13,
      version: 13,
      previousReturn: { ...v13.previousReturn, refundRequested: null },
      data: { ...v13.data, previousBalanceInFavor: 0 },
    };
    const migrated = migrateState(old);
    expect(migrated?.previousReturn.refundRequested).toBe(false);
    expect(migrated?.data.previousBalanceInFavor).toBe(1_200_000);
  });
});
