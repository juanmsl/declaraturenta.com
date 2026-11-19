import type { Asset, DeclarationData, Debt, LaborConcept } from './declaration';

/**
 * Exogenous information (información exógena): what third parties reported to the DIAN about
 * the taxpayer. The real import mechanism is not defined yet; the app simulates it with sample
 * data (see docs/context.md).
 */
export type ExogenousReport = {
  /** Labor payments by concept, as the employer reported them. */
  laborConcepts: LaborConcept[];
  /** Mandatory pension, health and solidarity contributions. */
  mandatoryContributions: number;
  /** Of which, mandatory pension contributions reported by the pension fund. */
  pensionContributions: number;
  pensionFund: string;
  withholdings: number;
  withholdingAgent: string;
  bankAccounts: Asset[];
  debts: Debt[];
  housingInterest: { amount: number; entity: string };
  prepaidHealth: { amount: number; entity: string };
  obligation: DeclarationData['obligation'];
};

const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);

/** Keeps concepts the user changed and takes the rest from the report. */
const mergeConcepts = (current: LaborConcept[], reported: LaborConcept[]): LaborConcept[] =>
  reported.map(concept => {
    const edited = current.find(item => item.id === concept.id && item.origin === 'user');
    return edited ? { ...edited, exogenousAmount: concept.amount } : concept;
  });

/** Prefills the return with the report. Values the user entered or changed are kept. */
export const applyExogenous = (data: DeclarationData, report: ExogenousReport): DeclarationData => {
  const concepts = mergeConcepts(data.labor.concepts, report.laborConcepts);

  return {
    ...data,
    obligation: { ...report.obligation },
    labor: {
      ...data.labor,
      concepts,
      salaries: sum(concepts.map(concept => concept.amount)),
      nonTaxableIncome: report.mandatoryContributions,
    },
    assets: [...data.assets.filter(asset => asset.origin === 'user'), ...report.bankAccounts],
    debts: [...data.debts.filter(debt => debt.origin === 'user'), ...report.debts],
    deductions: {
      ...data.deductions,
      housingInterestPaid: report.housingInterest.amount,
      prepaidHealthPaid: report.prepaidHealth.amount,
    },
    withholdings: report.withholdings,
  };
};

/** Removes every value that would come from the report ("Llenar sin exógena"). */
export const clearExogenous = (data: DeclarationData): DeclarationData => ({
  ...data,
  obligation: { creditCardPurchases: 0, totalPurchases: 0, deposits: 0 },
  labor: { ...data.labor, concepts: [], salaries: 0, nonTaxableIncome: 0 },
  assets: data.assets.filter(asset => asset.origin === 'user'),
  debts: data.debts.filter(debt => debt.origin === 'user'),
  deductions: { ...data.deductions, housingInterestPaid: 0, prepaidHealthPaid: 0 },
  withholdings: 0,
});

/** Distinct entities that reported data. */
export const countReportingEntities = (report: ExogenousReport): number =>
  new Set([
    ...report.laborConcepts.map(concept => concept.entity),
    report.withholdingAgent,
    report.pensionFund,
    report.housingInterest.entity,
    report.prepaidHealth.entity,
    ...report.bankAccounts.map(account => account.detail),
    ...report.debts.map(debt => debt.detail.split(' · ')[0]),
  ]).size;
