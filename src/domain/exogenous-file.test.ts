import { exogenousSheetFixture } from '@/mocks/exogenous-sheet-fixture';

import { ExogenousFileError, parseExogenousSheet } from './exogenous-file';

describe('parseExogenousSheet', () => {
  const file = parseExogenousSheet(exogenousSheetFixture);

  it('reads the year, the holder and the five thresholds', () => {
    expect(file.year).toBe(2025);
    expect(file.holder).toEqual({
      documentType: 'C. C.',
      documentNumber: '900000047',
      name: 'GOMEZ RUIZ LAURA MARIA',
    });
    expect(file.thresholds).toEqual({
      income: 181_500_000,
      assets: 40_000_000,
      cardSpending: 38_200_000,
      deposits: 185_000_000,
      purchases: 92_400_000,
    });
  });

  it('reads every reported line with its suggested use', () => {
    expect(file.lines).toHaveLength(18);
    expect(file.lines[0]).toMatchObject({
      reporterNit: '900111222',
      reporterName: 'EMPRESA ANDINA S.A.S.',
      detail: 'Pagos por salarios (Concepto: 2276)',
      amount: 170_000_000,
    });
  });

  it('rejects other spreadsheets', () => {
    expect(() =>
      parseExogenousSheet([
        ['Nombre', 'Total'],
        ['Algo', 1],
      ]),
    ).toThrow(ExogenousFileError);
  });
});
