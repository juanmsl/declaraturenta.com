import type { DeclarationData, DeclarationResult } from '@/domain/declaration';

export type DraftOrigin = 'exogenous' | 'box' | 'cap' | 'user' | null;

export type DraftRow =
  | { type: 'section'; label: string }
  | {
      type: 'line';
      box: number;
      label: string;
      value: number;
      origin: DraftOrigin;
      strong?: boolean;
    }
  | { type: 'total'; box: number; label: string; value: number; toPay: boolean };

/** Rows of the draft summary (Figma screen 08), shared by the screen and the PDF. */
export const buildDraftRows = (data: DeclarationData, result: DeclarationResult): DraftRow[] => {
  const hasExogenous = (items: { origin: string }[]) => items.some(item => item.origin === 'exogenous');
  const laborFromExogenous = data.labor.concepts.length > 0;
  const toPay = result.amountToPay > 0;

  return [
    { type: 'section', label: 'Patrimonio' },
    {
      type: 'line',
      box: 29,
      label: 'Patrimonio bruto',
      value: result.grossAssets,
      origin: hasExogenous(data.assets) ? 'exogenous' : 'user',
    },
    {
      type: 'line',
      box: 30,
      label: 'Deudas',
      value: result.totalDebts,
      origin: hasExogenous(data.debts) ? 'exogenous' : data.debts.length > 0 ? 'user' : null,
    },
    {
      type: 'line',
      box: 31,
      label: 'Patrimonio líquido',
      value: result.netAssets,
      origin: null,
      strong: true,
    },
    { type: 'section', label: 'Cédula general · Rentas de trabajo' },
    {
      type: 'line',
      box: 32,
      label: 'Ingresos brutos por rentas de trabajo',
      value: result.grossLaborIncome,
      origin: 'box',
    },
    {
      type: 'line',
      box: 33,
      label: 'Ingresos no constitutivos de renta',
      value: result.labor.nonTaxableIncome,
      origin: laborFromExogenous ? 'exogenous' : 'user',
    },
    {
      type: 'line',
      box: 34,
      label: 'Renta líquida',
      value: result.labor.netIncome,
      origin: null,
      strong: true,
    },
    ...(result.fees.grossIncome > 0
      ? ([
          { type: 'section', label: 'Cédula general · Honorarios con costos' },
          {
            type: 'line',
            box: 43,
            label: 'Ingresos brutos por honorarios y servicios',
            value: result.fees.grossIncome,
            origin: hasExogenous(data.fees.concepts) ? 'exogenous' : 'user',
          },
          {
            type: 'line',
            box: 44,
            label: 'Ingresos no constitutivos de renta',
            value: result.fees.nonTaxableIncome,
            origin: 'user',
          },
          { type: 'line', box: 45, label: 'Costos y deducciones', value: result.fees.costs, origin: 'user' },
          {
            type: 'line',
            box: 46,
            label: 'Renta líquida',
            value: result.fees.netIncome,
            origin: null,
            strong: true,
          },
        ] satisfies DraftRow[])
      : []),
    ...(result.capital.grossIncome > 0
      ? ([
          { type: 'section', label: 'Cédula general · Rentas de capital' },
          {
            type: 'line',
            box: 58,
            label: 'Ingresos brutos por rentas de capital',
            value: result.capital.grossIncome,
            origin: hasExogenous(data.capital.concepts) ? 'exogenous' : 'user',
          },
          {
            type: 'line',
            box: 59,
            label: 'Ingresos no constitutivos de renta',
            value: result.capital.nonTaxableIncome,
            origin: 'box',
          },
          {
            type: 'line',
            box: 61,
            label: 'Renta líquida',
            value: result.capital.netIncome,
            origin: null,
            strong: true,
          },
        ] satisfies DraftRow[])
      : []),
    ...(result.nonLabor.grossIncome > 0
      ? ([
          { type: 'section', label: 'Cédula general · Rentas no laborales' },
          {
            type: 'line',
            box: 74,
            label: 'Ingresos brutos por rentas no laborales',
            value: result.nonLabor.grossIncome,
            origin: hasExogenous(data.nonLabor.concepts) ? 'exogenous' : 'user',
          },
          {
            type: 'line',
            box: 78,
            label: 'Renta líquida',
            value: result.nonLabor.netIncome,
            origin: null,
            strong: true,
          },
        ] satisfies DraftRow[])
      : []),
    ...(result.fees.grossIncome > 0 || result.capital.grossIncome > 0 || result.nonLabor.grossIncome > 0
      ? ([
          { type: 'section', label: 'Cédula general · Total' },
          {
            type: 'line',
            box: 91,
            label: 'Renta líquida de la cédula general',
            value: result.generalNetIncome,
            origin: null,
            strong: true,
          },
        ] satisfies DraftRow[])
      : []),
    {
      type: 'line',
      box: 92,
      label: 'Rentas exentas y deducciones imputables',
      value: result.totalBenefits,
      origin: result.labor.benefitsExcess > 0 ? 'cap' : null,
    },
    {
      type: 'line',
      box: 93,
      label: 'Renta líquida ordinaria',
      value: result.taxableIncome,
      origin: null,
      strong: true,
    },
    ...(result.pensions.grossIncome > 0
      ? ([
          { type: 'section', label: 'Cédula de pensiones' },
          {
            type: 'line',
            box: 99,
            label: 'Ingresos brutos por pensiones',
            value: result.pensions.grossIncome,
            origin: hasExogenous(data.pensions.concepts) ? 'exogenous' : 'user',
          },
          {
            type: 'line',
            box: 100,
            label: 'Ingresos no constitutivos de renta',
            value: result.pensions.nonTaxableIncome,
            origin: 'user',
          },
          {
            type: 'line',
            box: 102,
            label: 'Rentas exentas de pensiones',
            value: result.pensions.exemptIncome,
            origin: 'box',
          },
          {
            type: 'line',
            box: 103,
            label: 'Renta líquida gravable de pensiones',
            value: result.pensions.taxableIncome,
            origin: null,
            strong: true,
          },
        ] satisfies DraftRow[])
      : []),
    ...dividendRows(data, result, hasExogenous(data.dividends.concepts) ? 'exogenous' : 'user'),
    ...(result.occasionalGains.grossIncome > 0
      ? ([
          { type: 'section', label: 'Ganancias ocasionales' },
          {
            type: 'line',
            box: 112,
            label: 'Ingresos por ganancias ocasionales',
            value: result.occasionalGains.grossIncome,
            origin: 'user',
          },
          { type: 'line', box: 113, label: 'Costos', value: result.occasionalGains.costs, origin: 'user' },
          {
            type: 'line',
            box: 114,
            label: 'No gravadas y exentas',
            value: result.occasionalGains.exempt,
            origin: 'box',
          },
          {
            type: 'line',
            box: 115,
            label: 'Ganancias ocasionales gravables',
            value: result.occasionalGains.taxable,
            origin: null,
            strong: true,
          },
        ] satisfies DraftRow[])
      : []),
    { type: 'section', label: 'Liquidación privada' },
    ...(result.tableBase > result.taxableIncome
      ? ([
          {
            type: 'line',
            box: 111,
            label: 'Renta líquida gravable (general, pensiones y dividendos)',
            value: result.tableBase,
            origin: null,
          },
        ] satisfies DraftRow[])
      : []),
    {
      type: 'line',
      box: 116,
      label: 'Impuesto sobre la renta líquida gravable',
      value: result.tableTax.tax,
      origin: null,
    },
    ...(result.netIncomeTax !== result.tableTax.tax
      ? ([
          {
            type: 'line',
            box: 126,
            label: 'Impuesto neto de renta',
            value: result.netIncomeTax,
            origin: null,
          },
        ] satisfies DraftRow[])
      : []),
    ...(result.occasionalGainsTax > 0
      ? ([
          {
            type: 'line',
            box: 127,
            label: 'Impuesto de ganancias ocasionales',
            value: result.occasionalGainsTax,
            origin: null,
          },
        ] satisfies DraftRow[])
      : []),
    {
      type: 'line',
      box: 132,
      label: 'Retenciones del año gravable',
      value: result.withholdings,
      origin: laborFromExogenous ? 'exogenous' : 'user',
    },
    {
      type: 'line',
      box: 133,
      label: 'Anticipo para el año siguiente',
      value: result.advance.amount,
      origin: null,
    },
    {
      type: 'total',
      box: toPay ? 136 : 137,
      label: toPay ? 'Saldo a pagar' : 'Saldo a favor',
      value: toPay ? result.amountToPay : result.amountInFavor,
      toPay,
    },
  ];
};

const dividendRows = (data: DeclarationData, result: DeclarationResult, origin: DraftOrigin): DraftRow[] => {
  const { dividends } = result;
  const lines: DraftRow[] = [
    { type: 'line', box: 104, label: 'Dividendos 2016 y anteriores', value: dividends.until2016, origin },
    {
      type: 'line',
      box: 105,
      label: 'Ingresos no constitutivos de renta',
      value: dividends.until2016NonTaxed,
      origin,
    },
    {
      type: 'line',
      box: 107,
      label: '1.ª subcédula, 2017 y siguientes',
      value: dividends.firstSubcedule,
      origin,
    },
    {
      type: 'line',
      box: 108,
      label: '2.ª subcédula, 2017 y siguientes',
      value: dividends.secondSubcedule,
      origin,
    },
    { type: 'line', box: 109, label: 'Dividendos recibidos del exterior', value: dividends.foreign, origin },
  ].filter(row => row.value > 0) as DraftRow[];
  return data.dividends.concepts.length > 0 && lines.length > 0
    ? [{ type: 'section', label: 'Cédula de dividendos y participaciones' }, ...lines]
    : [];
};
