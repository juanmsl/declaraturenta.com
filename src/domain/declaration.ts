import { computeAdvancePayment } from './advance-payment';
import type { AdvancePayment, FilingCount } from './advance-payment';
import { evaluateFilingObligation } from './filing-obligation';
import type { FilingObligation } from './filing-obligation';
import { computeTableTax } from './income-tax-table';
import type { TableTax } from './income-tax-table';
import { computeLaborIncome } from './labor-income';
import type { LaborIncomeResult } from './labor-income';
import { computeDividends, computeOccasionalGains, computePensions } from './other-schedules';
import type {
  DividendConcept,
  DividendResult,
  OccasionalGainConcept,
  OccasionalGainsResult,
  PensionData,
  PensionResult,
} from './other-schedules';
import { UVT_2025, uvtToPesos } from './uvt';

/** Box 28 cap: 1 % of purchases with electronic invoice, up to 240 UVT (art. 336 E.T.). */
export const ELECTRONIC_INVOICE_CAP_UVT = 240;
/** Box 139: 72 UVT per dependent, up to 4 (art. 336 E.T.). */
export const ADDITIONAL_DEPENDENT_UVT = 72;
export const MAX_ADDITIONAL_DEPENDENTS = 4;

/** Where a value comes from: the DIAN exogenous report, the user, or our calculation. */
export type ValueOrigin = 'exogenous' | 'user';

/** One income line that adds up to a gross income box (e.g. salary, CDT yields). */
export type IncomeConcept = {
  id: string;
  label: string;
  entity: string;
  amount: number;
  origin: ValueOrigin;
  /** What the exogenous report said, when the user changed it. */
  exogenousAmount?: number;
  /** Financial yields (interest, CDT, funds): part of them is not income (box 59). */
  financial?: boolean;
};

/** How fees are declared: subtracting costs (43–57) or with the 25 % exempt income (32). */
export type FeesOption = 'costs' | 'exempt';

/** Indicative cap of costs for fees (art. 336-1 E.T.): above 60 % of 43 box 140 must be marked. */
export const FEES_INDICATIVE_COSTS_RATE = 0.6;

/** One labor payment that adds up to box 32 (e.g. salary, bonus). */
export type LaborConcept = IncomeConcept;

/**
 * Inflationary component of financial yields for taxable year 2025: 55,43 % is not income for
 * people not required to keep books (art. 40-1 E.T., Decreto 0898 de 2026).
 */
export const INFLATION_COMPONENT_RATE = 0.5543;

export type AssetKind = 'real-estate' | 'bank-account' | 'vehicle' | 'investment' | 'other';

export type Asset = {
  id: string;
  kind: AssetKind;
  label: string;
  detail: string;
  amount: number;
  origin: ValueOrigin;
  /** Imported with an informative value the user must check (e.g. a vehicle's appraisal). */
  needsReview?: boolean;
};

export type Debt = {
  id: string;
  label: string;
  detail: string;
  amount: number;
  origin: ValueOrigin;
};

export type DeclarationData = {
  general: {
    filingCount: FilingCount;
    /** Impuesto neto de renta of last year's return. */
    previousYearNetTax: number;
    /** Box 28: 1 % of purchases backed by electronic invoices (capped at 240 UVT). */
    electronicInvoicePurchases: number;
  };
  /** Values only used by the filing obligation test, taken from the exogenous report. */
  obligation: {
    creditCardPurchases: number;
    totalPurchases: number;
    deposits: number;
  };
  labor: {
    /** "Salarios y pagos laborales" as confirmed by the user. */
    salaries: number;
    /** Breakdown of `salaries` reported in the exogenous file. */
    concepts: LaborConcept[];
    /** Labor payments missing from the employer's certificate. */
    otherPayments: number;
    /** Mandatory pension, health and solidarity fund contributions (box 33). */
    nonTaxableIncome: number;
    /** Voluntary AFC, FVP and AVC contributions (box 35). */
    voluntaryContributions: number;
    hasIndependentIncome: boolean | null;
  };
  /**
   * Fees and services as an independent (honorarios). Either their costs are subtracted (boxes
   * 43–57) or they join labor income with the 25 % exempt (box 32), never both (art. 206 par. 5).
   */
  fees: {
    concepts: IncomeConcept[];
    /** Mandatory pension and solidarity contributions paid as an independent (44, or 33). */
    nonTaxableIncome: number;
    /** Box 45: costs and expenses backed by electronic invoices. */
    costs: number;
    /** Option the person confirmed; null while they have not chosen (we use the suggested one). */
    option: FeesOption | null;
  };
  /** Rentas de capital (boxes 58–73): interest and financial yields. */
  capital: {
    concepts: IncomeConcept[];
    /** Mandatory pension paid as an independent contributor, assigned to this schedule (box 59). */
    independentContributions: number;
    /** Box 60. */
    costs: number;
  };
  /** Rentas no laborales (boxes 74–90): other income. */
  nonLabor: {
    concepts: IncomeConcept[];
    /** Box 75. */
    returns: number;
    /** Mandatory pension paid as an independent contributor, assigned to this schedule (box 76). */
    independentContributions: number;
    /** Box 77. */
    costs: number;
  };
  /** Cédula de pensiones (boxes 99–103). */
  pensions: PensionData;
  /** Cédula de dividendos y participaciones (boxes 104–110). */
  dividends: { concepts: DividendConcept[] };
  /** Ganancias ocasionales (boxes 112–115). */
  occasionalGains: { concepts: OccasionalGainConcept[] };
  assets: Asset[];
  debts: Debt[];
  deductions: {
    housingInterestPaid: number;
    prepaidHealthPaid: number;
    /**
     * Box 138: number of economic dependents. With one or more, box 39 includes the 10 % deduction
     * (art. 387 E.T.) and box 139 adds 72 UVT per dependent, up to 4 (art. 336 num. 3 E.T.). For
     * employees the same dependent counts in both (DIAN instructions, form 210 of 2026).
     */
    dependents: number;
  };
  /** Withholdings of the taxable year (box 132). */
  withholdings: number;
  /** Advance paid last year for this year (box 130). */
  previousYearAdvance: number;
  /** Balance in favor from last year not refunded (box 131). */
  previousBalanceInFavor: number;
  refundPreference: 'refund' | 'next-year';
};

export type FeesIncomeResult = {
  /** Option applied in this result. */
  option: FeesOption;
  /** Box 43 (0 with the exempt option: fees go to box 32). */
  grossIncome: number;
  /** Box 44. */
  nonTaxableIncome: number;
  /** Box 45. */
  costs: number;
  /** Box 46. */
  netIncome: number;
  /** Box 55. */
  loss: number;
  /** Box 140: costs above 60 % of 43. */
  exceedsIndicativeCap: boolean;
};

/** Tax due with each fees option, to suggest the one that leaves less tax. */
export type FeesComparison = {
  costs: number;
  exempt: number;
  suggested: FeesOption;
};

/** Boxes 41, 53, 69 and 86: the capped benefits distributed in the DIAN order. */
export type LimitedBenefits = { labor: number; fees: number; capital: number; nonLabor: number };

export type DeclarationResult = {
  obligation: FilingObligation;
  grossAssets: number;
  totalDebts: number;
  netAssets: number;
  /** Box 32: salaries + other labor payments. */
  grossLaborIncome: number;
  labor: LaborIncomeResult;
  fees: FeesIncomeResult;
  /** Present when there are fees: tax due with each option. */
  feesComparison: FeesComparison | null;
  limitedBenefits: LimitedBenefits;
  capital: CapitalIncomeResult;
  nonLabor: NonLaborIncomeResult;
  pensions: PensionResult;
  dividends: DividendResult;
  occasionalGains: OccasionalGainsResult;
  /**
   * Gross income of the year for filing test 1: every schedule plus occasional gains (box 112,
   * exempt part included), as arts. 26 and 592 E.T. add ordinary and extraordinary income.
   */
  grossIncome: number;
  /** Gross income of the general schedule: 32 + 43 + 58 + 74. */
  generalGrossIncome: number;
  /**
   * Box 91: renta líquida of the general schedule (41 + 42 + 53 + 57 + 69 + 73 + 86 + 90). Without
   * losses, compensations or ECE income it equals 34 + 46 + 61 + 78.
   */
  generalNetIncome: number;
  /**
   * Base of the 40 % cap: gross income of the general schedule minus its non-taxable income
   * (32 + 43 + 58 + 74 − 33 − 44 − 59 − 76). Costs and returns are not subtracted (DIAN instructions).
   */
  benefitsCapBase: number;
  /** Box 28 after its cap. */
  electronicInvoiceDeduction: number;
  /** Box 139: 72 UVT per dependent, up to 4, capped at boxes 42 + 57. */
  dependentsAddition: number;
  /** Box 92: exempt income and deductions that reduce net income. */
  totalBenefits: number;
  /** Renta líquida gravable cédula general (box 97). */
  taxableIncome: number;
  /** Box 111: 97 (renta presuntiva is 0 %) + 103 + 107 + 108 − 118. */
  tableBase: number;
  /** Box 116: art. 241 table over box 111. */
  tableTax: TableTax;
  /** Box 121 = 116 + 118 + 119 + 120. */
  totalIncomeTax: number;
  /** Box 125: only the dividends discount (124) is modeled. */
  taxDiscounts: number;
  /** Impuesto neto de renta (box 126). */
  netIncomeTax: number;
  /** Box 127. */
  occasionalGainsTax: number;
  /** Impuesto a cargo (box 129). */
  taxDue: number;
  withholdings: number;
  advance: AdvancePayment;
  /** Positive: amount to pay. Negative: balance in favor. */
  balance: number;
  amountToPay: number;
  amountInFavor: number;
};

const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);

export type CapitalIncomeResult = {
  /** Box 58. */
  grossIncome: number;
  /** Part of financial yields that is not income. */
  inflationComponent: number;
  /** Box 59: inflationary component + independent contributions. */
  nonTaxableIncome: number;
  /** Box 60. */
  costs: number;
  /** Box 61 (and 70 and 73: no exemptions, deductions or losses modeled yet). */
  netIncome: number;
};

export type NonLaborIncomeResult = {
  /** Box 74. */
  grossIncome: number;
  /** Box 75. */
  returns: number;
  /** Box 76. */
  nonTaxableIncome: number;
  /** Box 77. */
  costs: number;
  /** Box 78 (and 87 and 90). */
  netIncome: number;
};

const conceptsTotal = (concepts: readonly IncomeConcept[]) => sum(concepts.map(concept => concept.amount));

/** Rentas de capital: financial yields lose their inflationary component (box 59). */
export const computeCapitalIncome = (capital: DeclarationData['capital']): CapitalIncomeResult => {
  const grossIncome = conceptsTotal(capital.concepts);
  const inflationComponent = Math.round(
    conceptsTotal(capital.concepts.filter(concept => concept.financial)) * INFLATION_COMPONENT_RATE,
  );
  const nonTaxableIncome = inflationComponent + Math.max(0, capital.independentContributions);
  const costs = Math.max(0, capital.costs);
  return {
    grossIncome,
    inflationComponent,
    nonTaxableIncome,
    costs,
    netIncome: Math.max(0, grossIncome - nonTaxableIncome - costs),
  };
};

export const computeNonLaborIncome = (nonLabor: DeclarationData['nonLabor']): NonLaborIncomeResult => {
  const grossIncome = conceptsTotal(nonLabor.concepts);
  const returns = Math.max(0, nonLabor.returns);
  const nonTaxableIncome = Math.max(0, nonLabor.independentContributions);
  const costs = Math.max(0, nonLabor.costs);
  return {
    grossIncome,
    returns,
    nonTaxableIncome,
    costs,
    netIncome: Math.max(0, grossIncome - returns - nonTaxableIncome - costs),
  };
};

export const computeFeesIncome = (fees: DeclarationData['fees'], option: FeesOption): FeesIncomeResult => {
  if (option === 'exempt') {
    return {
      option,
      grossIncome: 0,
      nonTaxableIncome: 0,
      costs: 0,
      netIncome: 0,
      loss: 0,
      exceedsIndicativeCap: false,
    };
  }
  const grossIncome = conceptsTotal(fees.concepts);
  const nonTaxableIncome = Math.max(0, fees.nonTaxableIncome);
  const costs = Math.max(0, fees.costs);
  return {
    option,
    grossIncome,
    nonTaxableIncome,
    costs,
    netIncome: Math.max(0, grossIncome - nonTaxableIncome - costs),
    loss: Math.max(0, nonTaxableIncome + costs - grossIncome),
    exceedsIndicativeCap: grossIncome > 0 && costs / grossIncome > FEES_INDICATIVE_COSTS_RATE,
  };
};

export type ComputeOptions = {
  /** Include deductions and their exempt-income effect (false before the deductions step). */
  includeDeductions?: boolean;
  uvtValue?: number;
};

/**
 * Computes every figure of the return from the user's data. Pure function. With fees and no option
 * confirmed, it computes both options and applies the one that leaves less tax.
 */
export const computeDeclaration = (
  data: DeclarationData,
  options: ComputeOptions = {},
): DeclarationResult => {
  if (data.fees.concepts.length === 0) return computeWithFeesOption(data, 'exempt', options, null);
  const withCosts = computeWithFeesOption(data, 'costs', options, null);
  const withExempt = computeWithFeesOption(data, 'exempt', options, null);
  const comparison: FeesComparison = {
    costs: withCosts.taxDue,
    exempt: withExempt.taxDue,
    suggested: withCosts.taxDue < withExempt.taxDue ? 'costs' : 'exempt',
  };
  const applied = data.fees.option ?? comparison.suggested;
  return { ...(applied === 'costs' ? withCosts : withExempt), feesComparison: comparison };
};

const computeWithFeesOption = (
  data: DeclarationData,
  feesOption: FeesOption,
  { includeDeductions = true, uvtValue = UVT_2025 }: ComputeOptions,
  feesComparison: FeesComparison | null,
): DeclarationResult => {
  const grossAssets = sum(data.assets.map(asset => asset.amount));
  const totalDebts = sum(data.debts.map(debt => debt.amount));
  const fees = computeFeesIncome(data.fees, feesOption);
  // With the exempt option, fees and their contributions join labor income (boxes 32 and 33).
  const feesInLabor = feesOption === 'exempt' ? conceptsTotal(data.fees.concepts) : 0;
  const feesNonTaxableInLabor = feesOption === 'exempt' ? Math.max(0, data.fees.nonTaxableIncome) : 0;
  const grossLaborIncome = data.labor.salaries + data.labor.otherPayments + feesInLabor;
  const laborNonTaxableIncome = data.labor.nonTaxableIncome + feesNonTaxableInLabor;
  const capital = computeCapitalIncome(data.capital);
  const nonLabor = computeNonLaborIncome(data.nonLabor);
  const pensions = computePensions(data.pensions, uvtValue);
  const dividends = computeDividends(data.dividends.concepts, uvtValue);
  const occasionalGains = computeOccasionalGains(data.occasionalGains.concepts, uvtValue);
  const generalGrossIncome = grossLaborIncome + fees.grossIncome + capital.grossIncome + nonLabor.grossIncome;
  const grossIncome =
    generalGrossIncome +
    pensions.grossIncome +
    dividends.until2016 +
    dividends.firstSubcedule +
    dividends.secondSubcedule +
    dividends.foreign +
    occasionalGains.grossIncome;
  const laborNetIncome = Math.max(0, grossLaborIncome - laborNonTaxableIncome);
  const generalNetIncome = laborNetIncome + fees.netIncome + capital.netIncome + nonLabor.netIncome;
  const benefitsCapBase = Math.max(
    0,
    generalGrossIncome -
      laborNonTaxableIncome -
      fees.nonTaxableIncome -
      capital.nonTaxableIncome -
      nonLabor.nonTaxableIncome,
  );

  const obligation = evaluateFilingObligation(
    {
      grossAssets,
      grossIncome,
      creditCardPurchases: data.obligation.creditCardPurchases,
      totalPurchases: data.obligation.totalPurchases,
      deposits: data.obligation.deposits,
    },
    uvtValue,
  );

  const labor = computeLaborIncome(
    {
      grossIncome: grossLaborIncome,
      nonTaxableIncome: laborNonTaxableIncome,
      voluntaryContributions: data.labor.voluntaryContributions,
      housingInterestPaid: data.deductions.housingInterestPaid,
      prepaidHealthPaid: data.deductions.prepaidHealthPaid,
      hasDependent: data.deductions.dependents > 0,
      includeDeductions,
      capBase: benefitsCapBase,
    },
    uvtValue,
  );

  const electronicInvoiceDeduction = includeDeductions
    ? Math.min(
        Math.max(0, data.general.electronicInvoicePurchases),
        uvtToPesos(ELECTRONIC_INVOICE_CAP_UVT, uvtValue),
      )
    : 0;
  // Boxes 41, 53, 69 and 86: the capped benefits go first to labor, then fees, capital and
  // non-labor income, never above each column's net income (DIAN instructions).
  let remaining = labor.cappedBenefits;
  const take = (limit: number) => {
    const taken = Math.min(remaining, Math.max(0, limit));
    remaining -= taken;
    return taken;
  };
  const limitedBenefits: LimitedBenefits = {
    labor: take(labor.netIncome),
    fees: take(fees.netIncome),
    capital: take(capital.netIncome),
    nonLabor: take(nonLabor.netIncome),
  };
  const laborOrdinaryIncome = labor.netIncome - limitedBenefits.labor;
  const feesOrdinaryIncome = fees.netIncome - limitedBenefits.fees;

  // Box 139: outside the 40 % / 1.340 UVT cap, but never above boxes 42 + 57 (labor ordinary income).
  const dependentsAddition = includeDeductions
    ? Math.min(
        uvtToPesos(
          Math.min(Math.max(0, Math.floor(data.deductions.dependents)), MAX_ADDITIONAL_DEPENDENTS) *
            ADDITIONAL_DEPENDENT_UVT,
          uvtValue,
        ),
        laborOrdinaryIncome + feesOrdinaryIncome,
      )
    : 0;
  const totalBenefits =
    limitedBenefits.labor +
    limitedBenefits.fees +
    limitedBenefits.capital +
    limitedBenefits.nonLabor +
    electronicInvoiceDeduction +
    dependentsAddition;
  const taxableIncome = Math.max(0, generalNetIncome - totalBenefits);
  const tableBase = taxableIncome + pensions.taxableIncome + dividends.baseForTable;
  const tableTax = computeTableTax(tableBase, uvtValue);
  const totalIncomeTax =
    tableTax.tax + dividends.secondSubceduleTax + dividends.until2016Tax + dividends.foreignTax;
  const taxDiscounts = dividends.discount;
  const netIncomeTax = Math.max(0, totalIncomeTax - taxDiscounts);
  const occasionalGainsTax = occasionalGains.tax;
  const taxDue = netIncomeTax + occasionalGainsTax;

  const advance = computeAdvancePayment({
    filingCount: data.general.filingCount,
    currentNetTax: netIncomeTax,
    previousNetTax: data.general.previousYearNetTax,
    withholdings: data.withholdings,
  });

  const balance =
    taxDue + advance.amount - data.previousYearAdvance - data.previousBalanceInFavor - data.withholdings;

  return {
    obligation,
    grossAssets,
    totalDebts,
    netAssets: Math.max(0, grossAssets - totalDebts),
    grossLaborIncome,
    labor,
    fees,
    feesComparison,
    limitedBenefits,
    capital,
    nonLabor,
    pensions,
    dividends,
    occasionalGains,
    grossIncome,
    generalGrossIncome,
    generalNetIncome,
    benefitsCapBase,
    electronicInvoiceDeduction,
    dependentsAddition,
    totalBenefits,
    taxableIncome,
    tableBase,
    tableTax,
    totalIncomeTax,
    taxDiscounts,
    netIncomeTax,
    occasionalGainsTax,
    taxDue,
    withholdings: data.withholdings,
    advance,
    balance,
    amountToPay: Math.max(0, balance),
    amountInFavor: Math.max(0, -balance),
  };
};

/** A return with nothing filled in, used when the user imports their own exogenous report. */
export const createEmptyDeclaration = (): DeclarationData => ({
  general: { filingCount: 'third-or-more', previousYearNetTax: 0, electronicInvoicePurchases: 0 },
  obligation: { creditCardPurchases: 0, totalPurchases: 0, deposits: 0 },
  labor: {
    salaries: 0,
    concepts: [],
    otherPayments: 0,
    nonTaxableIncome: 0,
    voluntaryContributions: 0,
    hasIndependentIncome: false,
  },
  fees: { concepts: [], nonTaxableIncome: 0, costs: 0, option: null },
  capital: { concepts: [], independentContributions: 0, costs: 0 },
  nonLabor: { concepts: [], returns: 0, independentContributions: 0, costs: 0 },
  pensions: { concepts: [], nonTaxableIncome: 0, months: 12 },
  dividends: { concepts: [] },
  occasionalGains: { concepts: [] },
  assets: [],
  debts: [],
  deductions: { housingInterestPaid: 0, prepaidHealthPaid: 0, dependents: 0 },
  withholdings: 0,
  previousYearAdvance: 0,
  previousBalanceInFavor: 0,
  refundPreference: 'refund',
});
