import type { ExogenousReport } from '@/domain/exogenous';

import { sampleDeclaration } from './sample-declaration';

/** Fictional exogenous report of the sample taxpayer. Entities are fictional. */
export const sampleExogenous: ExogenousReport = {
  laborConcepts: sampleDeclaration.labor.concepts.map(concept =>
    concept.exogenousAmount === undefined
      ? concept
      : {
          id: concept.id,
          label: concept.label,
          entity: concept.entity,
          amount: concept.exogenousAmount,
          origin: 'exogenous',
        },
  ),
  mandatoryContributions: 16_200_000,
  pensionContributions: 7_200_000,
  pensionFund: 'Fondo Altiplano',
  withholdings: 11_240_000,
  withholdingAgent: 'Empresa Andina S.A.S.',
  bankAccounts: sampleDeclaration.assets.filter(asset => asset.origin === 'exogenous'),
  debts: sampleDeclaration.debts.filter(debt => debt.origin === 'exogenous'),
  housingInterest: { amount: 14_400_000, entity: 'Banco Cordillera' },
  prepaidHealth: { amount: 4_800_000, entity: 'Medicina Sabana S.A.' },
  obligation: { ...sampleDeclaration.obligation },
};
