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

  it('adds the new deductions, «Otros ajustes» and filing data to a version 11 state', () => {
    const data: Record<string, unknown> = { ...structuredClone(sampleDeclaration) };
    delete data.adjustments;
    delete data.filing;
    data.deductions = { housingInterestPaid: 1, prepaidHealthPaid: 2, dependents: 1 };
    const migrated = migrateState({ ...createInitialState(), version: 11, data });
    expect(migrated?.version).toBe(STATE_VERSION);
    expect(migrated?.data.deductions.housingInterestPaid).toBe(1);
    expect(migrated?.data.deductions.gmfPaid).toBe(0);
    expect(migrated?.data.adjustments.enabled).toEqual([]);
    expect(migrated?.data.filing.date).toBeNull();
  });

  it('drops a state that still shows the fictional sample taxpayer', () => {
    expect(migrateState(oldState(10, structuredClone(sampleDeclaration), true))).toBeNull();
  });

  it('does not migrate versions older than 7 or values that are not states', () => {
    expect(migrateState({ ...createInitialState(), version: 6 })).toBeNull();
    expect(migrateState('hola')).toBeNull();
  });

  it('turns boxes 60, 75, 76 and 77 of a version 14 state into concepts', () => {
    const data = {
      ...sampleDeclaration,
      capital: { concepts: [], independentContributions: 0, costs: 200_000 },
      nonLabor: { concepts: [], returns: 0, independentContributions: 90_000, costs: 40_000 },
    };
    const migrated = migrateState(oldState(14, data));
    expect(migrated?.version).toBe(STATE_VERSION);
    expect(migrated?.data.capital.costConcepts.map(concept => concept.amount)).toEqual([200_000]);
    expect(migrated?.data.nonLabor.returnConcepts).toEqual([]);
    expect(migrated?.data.nonLabor.contributionConcepts[0]).toMatchObject({ amount: 90_000, origin: 'user' });
    expect(migrated?.data.nonLabor.costConcepts[0]?.amount).toBe(40_000);
    expect(migrated?.data.nonLabor).not.toHaveProperty('costs');
  });

  it('turns the losses, 95 and 96 of a version 15 state into concepts, only if their switch was on', () => {
    const data = {
      ...sampleDeclaration,
      adjustments: {
        ...sampleDeclaration.adjustments,
        enabled: ['losses', 'ece'],
        losses: { fees: 0, capital: 8_000_000, nonLabor: 0, until2018: 0 },
        presumptiveExcess: 4_000_000,
        taxableAdditions: 0,
      },
    };
    const migrated = migrateState(oldState(15, data));
    const adjustments = migrated?.data.adjustments;
    expect(adjustments?.enabled).toEqual(['ece']);
    expect(adjustments?.losses.capital.map(concept => concept.amount)).toEqual([8_000_000]);
    expect(adjustments?.losses.fees).toEqual([]);
    // The presumptive excess switch was off, so its amount did not count.
    expect(adjustments?.presumptiveExcessConcepts).toEqual([]);
    expect(adjustments).not.toHaveProperty('presumptiveExcess');
  });
});
