import { describe, expect, it } from 'vitest';

import { sampleDeclaration } from '@/mocks/sample-declaration';
import { sampleTaxpayer } from '@/mocks/sample-taxpayer';

import { createInitialState, STATE_VERSION } from './declaration-state';
import { migrateState } from './migrate-state';

/** A saved state of an older version, with a real (non-sample) taxpayer. */
const oldState = (version: number, data: Record<string, unknown>, isSample = false) => ({
  ...createInitialState(),
  version,
  data,
  taxpayer: { ...sampleTaxpayer, isSample },
});

describe('migrateState', () => {
  it('adds the empty pensions, dividends and occasional gains schedules to a version 7 state', () => {
    const oldData: Record<string, unknown> = { ...structuredClone(sampleDeclaration) };
    delete oldData.pensions;
    delete oldData.dividends;
    delete oldData.occasionalGains;
    delete oldData.fees;
    const migrated = migrateState(oldState(7, oldData));
    expect(migrated?.version).toBe(STATE_VERSION);
    expect(migrated?.data.pensions).toEqual({ concepts: [], nonTaxableIncome: 0, months: 12 });
    expect(migrated?.data.dividends.concepts).toEqual([]);
    expect(migrated?.data.occasionalGains.concepts).toEqual([]);
    expect(migrated?.data.fees.option).toBeNull();
    expect(migrated?.data.labor.salaries).toBe(180_000_000);
  });

  it('drops isSample and adds the VAT answer to a version 10 state', () => {
    const obligation: Partial<typeof sampleDeclaration.obligation> = { ...sampleDeclaration.obligation };
    delete obligation.vatResponsible;
    const migrated = migrateState(oldState(10, { ...structuredClone(sampleDeclaration), obligation }));
    expect(migrated?.taxpayer).toEqual(sampleTaxpayer);
    expect(migrated?.data.obligation.vatResponsible).toBe(false);
    expect(migrated?.data.obligation.deposits).toBe(185_000_000);
  });

  it('drops a state that still shows the fictional sample taxpayer', () => {
    expect(migrateState(oldState(10, structuredClone(sampleDeclaration), true))).toBeNull();
  });

  it('does not migrate versions older than 7 or values that are not states', () => {
    expect(migrateState({ ...createInitialState(), version: 6 })).toBeNull();
    expect(migrateState('hola')).toBeNull();
  });
});
