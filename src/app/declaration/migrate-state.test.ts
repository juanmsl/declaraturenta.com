import { describe, expect, it } from 'vitest';

import { createInitialState, STATE_VERSION } from './declaration-state';
import { migrateState } from './migrate-state';

describe('migrateState', () => {
  it('adds the empty pensions, dividends and occasional gains schedules to a version 7 state', () => {
    const oldData: Record<string, unknown> = { ...createInitialState().data };
    delete oldData.pensions;
    delete oldData.dividends;
    delete oldData.occasionalGains;
    const migrated = migrateState({ ...createInitialState(), version: 7, data: oldData });
    expect(migrated?.version).toBe(STATE_VERSION);
    expect(migrated?.data.pensions).toEqual({ concepts: [], nonTaxableIncome: 0, months: 12 });
    expect(migrated?.data.dividends.concepts).toEqual([]);
    expect(migrated?.data.occasionalGains.concepts).toEqual([]);
    expect(migrated?.data.labor.salaries).toBe(180_000_000);
  });

  it('does not migrate versions older than 7 or values that are not states', () => {
    expect(migrateState({ ...createInitialState(), version: 6 })).toBeNull();
    expect(migrateState('hola')).toBeNull();
  });
});
