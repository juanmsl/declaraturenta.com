import { AG_2025 } from './tax-years';
import { exogenousSheetFixture } from '@/mocks/exogenous-sheet-fixture';
import { sampleDeclaration } from '@/mocks/sample-declaration';
import { sampleExogenous } from '@/mocks/sample-exogenous';

import { computeDeclaration, createEmptyDeclaration } from './declaration';
import {
  applyExogenous,
  buildExogenousReport,
  classifyLine,
  clearExogenous,
  countReportingEntities,
  reportedTotal,
} from './exogenous';
import { parseExogenousSheet } from './exogenous-file';

describe('exogenous report', () => {
  it('reproduces the sample return and keeps the concept the user changed', () => {
    const applied = applyExogenous(sampleDeclaration, sampleExogenous, AG_2025);
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
    const refilled = applyExogenous(clearExogenous(sampleDeclaration), sampleExogenous, AG_2025);
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
    const data = applyExogenous(createEmptyDeclaration(), report, AG_2025);
    expect(data.labor.salaries).toBe(180_000_000);
    expect(data.labor.voluntaryContributions).toBe(6_000_000);
    expect(data.general.electronicInvoicePurchases).toBe(300_000);
    expect(data.obligation).toEqual({
      creditCardPurchases: 38_200_000,
      totalPurchases: 92_400_000,
      deposits: 185_000_000,
      vatResponsible: false,
    });
    expect(data.assets.find(asset => asset.kind === 'vehicle')?.needsReview).toBe(true);
    expect(data.previousBalanceInFavor).toBe(250_000);
  });
});

describe('capital and non-labor from the report', () => {
  const report = buildExogenousReport(parseExogenousSheet(exogenousSheetFixture), 'exogena.xlsx');

  it('fills rentas de capital as financial yields and rentas no laborales', () => {
    const data = applyExogenous(createEmptyDeclaration(), report, AG_2025);
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
    const cleared = clearExogenous(applyExogenous(createEmptyDeclaration(), report, AG_2025));
    expect(cleared.capital.concepts).toEqual([]);
    expect(cleared.nonLabor.concepts).toEqual([]);
  });
});

describe('fees, pensions, dividends and occasional gains from the report', () => {
  const line = (suggestedUse: string, detail = 'Pago reportado') => ({
    id: suggestedUse,
    reporterNit: '900000001',
    reporterName: 'Entidad Ficticia S.A.S.',
    detail,
    amount: 1_000_000,
    suggestedUse,
    extra: '',
  });

  it('classifies them by the box the DIAN suggests', () => {
    expect(classifyLine(line('R43 Ingresos brutos por honorarios')).kind).toBe('fees-income');
    expect(classifyLine(line('R99 Ingresos brutos por pensiones')).kind).toBe('pension-income');
    expect(classifyLine(line('R107 Dividendos 1a subcédula'))).toMatchObject({
      kind: 'dividend',
      dividendKind: 'first-subcedule',
    });
    expect(classifyLine(line('R104 Dividendos 2016 y anteriores'))).toMatchObject({
      dividendKind: 'until-2016-taxed',
      review: 'dividend',
    });
    expect(classifyLine(line('R112 Ganancias ocasionales'))).toMatchObject({
      kind: 'occasional-gain',
      review: 'occasional-gain',
    });
  });

  it('sends independent contributions to fees when there are fees', () => {
    const base = buildExogenousReport(parseExogenousSheet(exogenousSheetFixture), 'exogena.xlsx');
    const report = {
      ...base,
      items: [
        ...base.items,
        {
          id: 'fees',
          kind: 'fees-income' as const,
          label: 'Honorarios',
          entity: 'Cliente',
          amount: 9_000_000,
        },
      ],
    };
    const data = applyExogenous(createEmptyDeclaration(), report, AG_2025);
    expect(data.fees.concepts.map(concept => concept.amount)).toEqual([9_000_000]);
    expect(data.labor.hasIndependentIncome).toBe(true);
    expect(data.fees.nonTaxableIncome).toBe(reportedTotal(report, 'other-non-taxable'));
    expect(data.capital.independentContributions).toBe(0);
  });
});
