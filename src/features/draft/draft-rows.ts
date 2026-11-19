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
    ...(result.capital.grossIncome > 0 || result.nonLabor.grossIncome > 0
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
    { type: 'section', label: 'Liquidación privada' },
    {
      type: 'line',
      box: 116,
      label: 'Impuesto sobre la renta líquida gravable',
      value: result.netIncomeTax,
      origin: null,
    },
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
