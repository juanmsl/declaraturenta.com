import type { DeclarationData } from '@/domain/declaration';

/**
 * Fictional return of the sample taxpayer, as prefilled from her (fictional) exogenous report.
 * Figures match the Figma flow. Entities are fictional.
 */
export const sampleDeclaration: DeclarationData = {
  general: {
    filingCount: 'third-or-more',
    previousYearNetTax: 7_400_000,
    electronicInvoicePurchases: 0,
  },
  obligation: {
    creditCardPurchases: 38_200_000,
    totalPurchases: 92_400_000,
    deposits: 185_000_000,
    vatResponsible: false,
  },
  labor: {
    salaries: 180_000_000,
    concepts: [
      {
        id: 'salary',
        label: 'Salario',
        entity: 'Empresa Andina S.A.S.',
        amount: 146_000_000,
        origin: 'exogenous',
      },
      {
        id: 'service-bonus',
        label: 'Prima de servicios',
        entity: 'Empresa Andina S.A.S.',
        amount: 12_500_000,
        origin: 'exogenous',
      },
      {
        id: 'severance',
        label: 'Cesantías e intereses pagados',
        entity: 'Empresa Andina S.A.S.',
        amount: 7_250_000,
        origin: 'exogenous',
      },
      {
        id: 'vacation',
        label: 'Vacaciones',
        entity: 'Empresa Andina S.A.S.',
        amount: 6_250_000,
        origin: 'exogenous',
      },
      {
        id: 'performance-bonus',
        label: 'Bonificación por desempeño',
        entity: 'Empresa Andina S.A.S.',
        amount: 4_000_000,
        origin: 'user',
        exogenousAmount: 3_600_000,
      },
      {
        id: 'food-allowance',
        label: 'Auxilio de alimentación',
        entity: 'Empresa Andina S.A.S.',
        amount: 4_000_000,
        origin: 'exogenous',
      },
    ],
    otherPayments: 0,
    nonTaxableIncome: 16_200_000,
    voluntaryContributions: 0,
    hasIndependentIncome: false,
  },
  fees: { concepts: [], nonTaxableIncome: 0, costs: 0, option: null },
  capital: { concepts: [], independentContributions: 0, costs: 0 },
  nonLabor: { concepts: [], returns: 0, independentContributions: 0, costs: 0 },
  pensions: { concepts: [], nonTaxableIncome: 0, months: 12 },
  dividends: { concepts: [] },
  occasionalGains: { concepts: [] },
  assets: [
    {
      id: 'apartment',
      kind: 'real-estate',
      label: 'Apartamento en Bogotá',
      detail: 'Mayor valor entre avalúo catastral y costo fiscal',
      amount: 310_000_000,
      origin: 'user',
    },
    {
      id: 'savings',
      kind: 'bank-account',
      label: 'Cuentas de ahorro',
      detail: 'Banco Cordillera',
      amount: 18_500_000,
      origin: 'exogenous',
    },
  ],
  debts: [
    {
      id: 'mortgage',
      label: 'Crédito hipotecario',
      detail: 'Banco Cordillera · saldo al 31 de diciembre',
      amount: 120_000_000,
      origin: 'exogenous',
    },
  ],
  deductions: {
    housingInterestPaid: 14_400_000,
    prepaidHealthPaid: 4_800_000,
    dependents: 1,
  },
  withholdings: 11_240_000,
  previousYearAdvance: 0,
  previousBalanceInFavor: 0,
  refundPreference: 'refund',
};
