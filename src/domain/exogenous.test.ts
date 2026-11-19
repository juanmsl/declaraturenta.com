import { sampleDeclaration } from '@/mocks/sample-declaration';
import { sampleExogenous } from '@/mocks/sample-exogenous';

import { computeDeclaration } from './declaration';
import { applyExogenous, clearExogenous, countReportingEntities } from './exogenous';

describe('exogenous report', () => {
  it('reproduces the sample return and keeps the concept the user changed', () => {
    const applied = applyExogenous(sampleDeclaration, sampleExogenous);
    expect(applied).toEqual(sampleDeclaration);
    expect(applied.labor.salaries).toBe(180_000_000);
  });

  it('clears every reported value but keeps what the user entered', () => {
    const cleared = clearExogenous(sampleDeclaration);
    expect(cleared.labor.salaries).toBe(0);
    expect(cleared.withholdings).toBe(0);
    expect(cleared.assets.map(asset => asset.id)).toEqual(['apartment']);
    expect(cleared.debts).toEqual([]);
    expect(computeDeclaration(cleared).grossAssets).toBe(310_000_000);
  });

  it('refills from the report after clearing, using the reported concepts', () => {
    const refilled = applyExogenous(clearExogenous(sampleDeclaration), sampleExogenous);
    expect(refilled.labor.salaries).toBe(179_600_000);
    expect(refilled.withholdings).toBe(11_240_000);
  });

  it('counts the reporting entities', () => {
    expect(countReportingEntities(sampleExogenous)).toBe(4);
  });
});
