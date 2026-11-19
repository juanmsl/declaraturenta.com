import { exogenousSheetFixture } from '@/mocks/exogenous-sheet-fixture';
import { sampleDeclaration } from '@/mocks/sample-declaration';
import { sampleExogenous } from '@/mocks/sample-exogenous';

import { computeDeclaration, createEmptyDeclaration } from './declaration';
import {
  applyExogenous,
  buildExogenousReport,
  clearExogenous,
  countReportingEntities,
  reportedTotal,
} from './exogenous';
import { parseExogenousSheet } from './exogenous-file';

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

describe('buildExogenousReport', () => {
  const report = buildExogenousReport(parseExogenousSheet(exogenousSheetFixture), 'exogena.xlsx');
  const total = (kind: Parameters<typeof reportedTotal>[1]) => reportedTotal(report, kind);

  it('classifies each line by the box the DIAN suggests', () => {
    expect(total('labor-income')).toBe(180_000_000);
    expect(total('labor-non-taxable')).toBe(9_000_000);
    expect(total('withholding')).toBe(11_040_000);
    expect(total('capital-income')).toBe(1_000_000);
    expect(total('non-labor-income')).toBe(500_000);
    expect(total('previous-balance')).toBe(250_000);
    expect(total('electronic-invoice')).toBe(30_000_000);
    expect(report.items.filter(item => item.kind === 'informative')).toHaveLength(2);
  });

  it('keeps a voluntary contribution reported twice only once, marked for review', () => {
    const voluntary = report.items.filter(item => item.kind === 'voluntary-pension');
    expect(voluntary).toHaveLength(1);
    expect(voluntary[0]).toMatchObject({ amount: 6_000_000, review: 'duplicate' });
  });

  it('names assets without exposing full account numbers', () => {
    const assets = report.items.filter(item => item.kind === 'asset');
    expect(assets.map(asset => [asset.label, asset.assetKind, asset.review])).toEqual([
      ['Ahorro en pensión voluntaria', 'investment', undefined],
      ['Cuenta de ahorro ····3334', 'bank-account', undefined],
      ['CDT ····7778', 'investment', undefined],
      ['Vehículo placa ABC123', 'vehicle', 'vehicle'],
    ]);
  });

  it('keeps only the last two digits of the document', () => {
    expect(report.documentLastDigits).toBe('47');
    expect(JSON.stringify(report)).not.toContain('900000047');
  });

  it('fills a blank return', () => {
    const data = applyExogenous(createEmptyDeclaration(), report);
    expect(data.labor.salaries).toBe(180_000_000);
    expect(data.labor.voluntaryContributions).toBe(6_000_000);
    expect(data.general.electronicInvoicePurchases).toBe(300_000);
    expect(data.obligation).toEqual({
      creditCardPurchases: 38_200_000,
      totalPurchases: 92_400_000,
      deposits: 185_000_000,
    });
    expect(data.assets.find(asset => asset.kind === 'vehicle')?.needsReview).toBe(true);
    expect(data.previousBalanceInFavor).toBe(250_000);
  });
});

describe('capital and non-labor from the report', () => {
  const report = buildExogenousReport(parseExogenousSheet(exogenousSheetFixture), 'exogena.xlsx');

  it('fills rentas de capital as financial yields and rentas no laborales', () => {
    const data = applyExogenous(createEmptyDeclaration(), report);
    expect(data.capital.concepts.map(concept => [concept.amount, concept.financial])).toEqual([
      [500_000, true],
      [500_000, true],
    ]);
    expect(data.nonLabor.concepts.map(concept => concept.amount)).toEqual([500_000]);
    const result = computeDeclaration(data);
    expect(result.capital.inflationComponent).toBe(554_300);
    expect(result.capital.netIncome).toBe(445_700);
  });

  it('clears reported capital and non-labor income', () => {
    const cleared = clearExogenous(applyExogenous(createEmptyDeclaration(), report));
    expect(cleared.capital.concepts).toEqual([]);
    expect(cleared.nonLabor.concepts).toEqual([]);
  });
});
