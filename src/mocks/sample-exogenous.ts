import type { ExogenousItem, ExogenousReport } from '@/domain/exogenous';

import { sampleDeclaration } from './sample-declaration';

const EMPLOYER = 'Empresa Andina S.A.S.';

const laborItems: ExogenousItem[] = sampleDeclaration.labor.concepts.map(concept => ({
  id: concept.id,
  kind: 'labor-income',
  label: concept.label,
  entity: concept.entity,
  amount: concept.exogenousAmount ?? concept.amount,
}));

/** Fictional exogenous report of the sample taxpayer. Entities and people are fictional. */
export const sampleExogenous: ExogenousReport = {
  fileName: null,
  year: 2025,
  holderName: 'GOMEZ LAURA',
  documentLastDigits: '47',
  thresholds: {
    income: 180_000_000,
    assets: 328_500_000,
    cardSpending: sampleDeclaration.obligation.creditCardPurchases,
    deposits: sampleDeclaration.obligation.deposits,
    purchases: sampleDeclaration.obligation.totalPurchases,
  },
  items: [
    ...laborItems,
    {
      id: 'health',
      kind: 'labor-non-taxable',
      label: 'Aportes obligatorios a salud',
      entity: EMPLOYER,
      amount: 9_000_000,
    },
    {
      id: 'pension',
      kind: 'labor-non-taxable',
      label: 'Aportes obligatorios a pensión y solidaridad',
      entity: 'Fondo Altiplano',
      amount: 7_200_000,
    },
    {
      id: 'withholdings',
      kind: 'withholding',
      label: 'Retención en la fuente',
      entity: EMPLOYER,
      amount: 11_240_000,
    },
    {
      id: 'savings',
      kind: 'asset',
      assetKind: 'bank-account',
      label: 'Cuentas de ahorro',
      entity: 'Banco Cordillera',
      amount: 18_500_000,
    },
    {
      id: 'mortgage',
      kind: 'debt',
      label: 'Crédito hipotecario',
      entity: 'Banco Cordillera',
      amount: 120_000_000,
    },
    {
      id: 'housing-interest',
      kind: 'housing-interest',
      label: 'Intereses del crédito de vivienda',
      entity: 'Banco Cordillera',
      amount: 14_400_000,
      review: 'housing',
    },
    {
      id: 'prepaid-health',
      kind: 'prepaid-health',
      label: 'Pagos de medicina prepagada',
      entity: 'Medicina Sabana S.A.',
      amount: 4_800_000,
    },
  ],
};
