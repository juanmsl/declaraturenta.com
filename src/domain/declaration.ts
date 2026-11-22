import { computeAdvancePayment } from './advance-payment';
import type { AdvancePayment, FilingCount } from './advance-payment';
import { evaluateFilingObligation } from './filing-obligation';
import type { FilingObligation } from './filing-obligation';
import { computeTableTax } from './income-tax-table';
import type { TableTax } from './income-tax-table';
import { computeGeneralBenefits } from './general-benefits';
import type { GeneralBenefits, GeneralColumn } from './general-benefits';
import { computeLateFiling } from './late-filing';
import type { LateFiling, PriorLateFiling } from './late-filing';
import { computeDividends, computeOccasionalGains, computePensions } from './other-schedules';
import type {
  DividendConcept,
  DividendResult,
  OccasionalGainConcept,
  OccasionalGainsResult,
  PensionData,
  PensionResult,
} from './other-schedules';
import { AG_2025, uvtToPesos } from './tax-years';
import { roundToThousand } from './uvt';
import type { TaxYearConfig } from './tax-years';

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

/** One labor payment that adds up to box 32 (e.g. salary, bonus). */
export type LaborConcept = IncomeConcept;

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
  /** Values only used by the filing obligation test, from the exogenous report or typed in Patrimonio. */
  obligation: {
    creditCardPurchases: number;
    totalPurchases: number;
    deposits: number;
    /** Responsable de IVA during the year: obliged to file whatever the tests say. */
    vatResponsible: boolean;
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
    /** Box 60: costs and expenses, concept by concept (ADR 0052). */
    costConcepts: IncomeConcept[];
  };
  /** Rentas no laborales (boxes 74–90): other income. */
  nonLabor: {
    concepts: IncomeConcept[];
    /** Box 75: returns, rebates and discounts, concept by concept (ADR 0052). */
    returnConcepts: IncomeConcept[];
    /**
     * Box 76: mandatory pension paid as an independent contributor, assigned to this schedule. The
     * exogenous report's contributions come in as concepts; more can be added (ADR 0052).
     */
    contributionConcepts: IncomeConcept[];
    /** Box 77: costs and expenses, concept by concept (ADR 0052). */
    costConcepts: IncomeConcept[];
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
    /** Severance pay and its interest received or deposited in the year (part of box 32). */
    severanceReceived: number;
    /** Average monthly salary of the last six months; null uses salaries ÷ 12 (art. 206 num. 4). */
    severanceAverageSalary: number | null;
    /** Other exempt labor income within the cap: indemnities, maternity, funeral (box 36). */
    otherLaborExempt: number;
    /**
     * Exempt income without the 40 % cap: Andean Community (Decisión 578), tax treaties and art. 206
     * num. 5 to 8 (armed forces, judges, public university professors).
     */
    unlimitedExempt: { amount: number; column: GeneralColumn };
    /** GMF (4 × 1.000) paid; 50 % is deductible (art. 115). */
    gmfPaid: number;
    /** ICETEX loan interest paid (art. 119). */
    icetexInterest: number;
    /** Severance contributions as an independent (art. 126-1). */
    independentSeverance: number;
    /** Donations to non-profits of the special regime; 25 % is discounted (art. 257, box 123). */
    donations: number;
    /**
     * Box 138: number of economic dependents. With one or more, box 39 includes the 10 % deduction
     * (art. 387 E.T.) and box 139 adds 72 UVT per dependent, up to 4 (art. 336 num. 3 E.T.). For
     * employees the same dependent counts in both (DIAN instructions, form 210 of 2026).
     */
    dependents: number;
  };
  /** Uncommon boxes («Otros ajustes»); each group counts only when its switch is on. */
  adjustments: Adjustments;
  /** Filing date and voluntary contribution (Resultado). */
  filing: FilingData;
  /** Withholdings of the taxable year (box 132). */
  withholdings: number;
  /** Advance paid last year for this year (box 130). */
  previousYearAdvance: number;
  /** Balance in favor from last year not refunded (box 131). */
  previousBalanceInFavor: number;
  refundPreference: 'refund' | 'next-year';
};

/** Switches of «Otros ajustes» (Figma 15). */
export type AdjustmentId =
  | 'losses'
  | 'presumptive-excess'
  | 'taxable-additions'
  | 'ece'
  | 'foreign-taxes'
  | 'can-dividends'
  | 'other-discounts';

export type Adjustments = {
  enabled: AdjustmentId[];
  /** Losses of earlier years compensated in each column (56, 72, 89) and from 2018 or before (94). */
  losses: { fees: number; capital: number; nonLabor: number; until2018: number };
  /** Box 95: excess of renta presuntiva of earlier years. */
  presumptiveExcess: number;
  /** Box 96: omitted assets, nonexistent debts, recovered deductions, unjustified net worth. */
  taxableAdditions: number;
  /** Passive income of controlled foreign entities (62 and 79, and hidden boxes 268–269). */
  ece: { capitalIncome: number; capitalCosts: number; nonLaborIncome: number; nonLaborCosts: number };
  /** Box 122: income tax paid abroad, and the net foreign income it was paid on. */
  foreignTax: { paid: number; foreignIncome: number };
  /** Box 128: tax paid abroad on occasional gains (treaties). */
  occasionalForeignTax: number;
  /** Box 110: dividends from Andean Community countries included in 109. */
  canDividends: number;
  /** Other discounts of arts. 256 and 257-1 (research, sports scholarships), already computed. */
  otherDiscounts: number;
};

export type FilingData = {
  /** ISO date the person plans to file; null when not given. */
  date: string | null;
  priorLateFiling: PriorLateFiling;
  /** The DIAN sent a summons to file (art. 642). */
  summoned: boolean;
  /** Net assets of last year's return: base of the penalty without tax nor income. */
  previousNetAssets: number;
  /** Voluntary contribution (art. 244-1, box 141), in pesos or as % of the tax to pay. */
  voluntaryContribution: { mode: 'amount' | 'percent'; value: number };
};

/** Labor income (boxes 32–42), as the screens show it. */
export type LaborIncomeResult = {
  grossIncome: number;
  nonTaxableIncome: number;
  /** Renta líquida (box 34). */
  netIncome: number;
  housingInterest: number;
  dependent: number;
  prepaidHealth: number;
  /** Box 38. */
  housingDeduction: number;
  /** Box 39. */
  otherDeductions: number;
  /** Box 40. */
  totalDeductions: number;
  /** Box 35. */
  voluntaryContributions: number;
  /** 25 % exempt labor income (part of box 36). */
  exempt25: number;
  /** Box 37. */
  totalExempt: number;
  /** Every limited benefit of the general schedule before the cap. */
  benefitsBeforeCap: number;
  /** Cap: lower of 40 % of the cap base and 1.340 UVT. */
  benefitsCap: number;
  /** Limited benefits used (41 + 53 + 69 + 86). */
  cappedBenefits: number;
  /** Benefits that could not be used. */
  benefitsExcess: number;
  /** Renta líquida ordinaria (box 42). */
  ordinaryNetIncome: number;
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
  /** Exempt income and deductions of every column (35–41, 47–53, 63–69, 80–86). */
  benefits: GeneralBenefits;
  /** Compensated losses: 56, 72, 89 and 94; and 95 (presumptive excess). */
  compensations: {
    fees: number;
    capital: number;
    nonLabor: number;
    until2018: number;
    presumptiveExcess: number;
  };
  /** Boxes 62 and 79: net passive income of controlled foreign entities. */
  ece: { capital: number; nonLabor: number };
  /** Box 96. */
  taxableAdditions: number;
  /** Renta líquida ordinaria cédula general (box 93). */
  ordinaryIncome: number;
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
  /** Box 122: tax paid abroad, up to the Colombian tax on that income. */
  foreignTaxDiscount: number;
  /** Box 123: donations (25 %) and other discounts, up to 30 % of box 121 together (art. 258). */
  donationsDiscount: number;
  /** Part of the box 123 discounts left for next year (over the 30 % cap). */
  donationsExcess: number;
  /** Box 125 = 122 + 123 + 124. */
  taxDiscounts: number;
  /** Impuesto neto de renta (box 126). */
  netIncomeTax: number;
  /** Box 127. */
  occasionalGainsTax: number;
  /** Box 128: tax paid abroad on occasional gains, up to box 127. */
  occasionalForeignTaxDiscount: number;
  /** Impuesto a cargo (box 129). */
  taxDue: number;
  withholdings: number;
  advance: AdvancePayment;
  /** Box 135: late filing penalty. */
  lateFiling: LateFiling;
  /** Box 141: voluntary contribution, paid apart. */
  voluntaryContribution: number;
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
/** Rentas de capital: financial yields lose the year's inflationary component (art. 40-1 E.T.). */
export const computeCapitalIncome = (
  capital: DeclarationData['capital'],
  year: TaxYearConfig,
): CapitalIncomeResult => {
  const grossIncome = conceptsTotal(capital.concepts);
  const inflationComponent = Math.round(
    conceptsTotal(capital.concepts.filter(concept => concept.financial)) *
      year.general.inflationComponentRate,
  );
  const nonTaxableIncome = inflationComponent + Math.max(0, capital.independentContributions);
  const costs = conceptsTotal(capital.costConcepts);
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
  const returns = conceptsTotal(nonLabor.returnConcepts);
  const nonTaxableIncome = conceptsTotal(nonLabor.contributionConcepts);
  const costs = conceptsTotal(nonLabor.costConcepts);
  return {
    grossIncome,
    returns,
    nonTaxableIncome,
    costs,
    netIncome: Math.max(0, grossIncome - returns - nonTaxableIncome - costs),
  };
};

export const computeFeesIncome = (
  fees: DeclarationData['fees'],
  option: FeesOption,
  year: TaxYearConfig,
): FeesIncomeResult => {
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
    exceedsIndicativeCap: grossIncome > 0 && costs / grossIncome > year.general.feesIndicativeCostsRate,
  };
};

export type ComputeOptions = {
  /** Filing deadline (ISO date) for the late filing penalty; null when unknown. */
  filingDeadline?: string | null;
  /** Include deductions and their exempt-income effect (false before the deductions step). */
  includeDeductions?: boolean;
  /** Taxable year whose UVT, caps and tables apply. The screens always pass the selected year. */
  taxYear?: TaxYearConfig;
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
  { includeDeductions = true, taxYear: year = AG_2025, filingDeadline = null }: ComputeOptions,
  feesComparison: FeesComparison | null,
): DeclarationResult => {
  const positive = (value: number) => Math.max(0, value);
  const { adjustments } = data;
  const isOn = (id: AdjustmentId) => adjustments.enabled.includes(id);

  const grossAssets = sum(data.assets.map(asset => asset.amount));
  const totalDebts = sum(data.debts.map(debt => debt.amount));
  const fees = computeFeesIncome(data.fees, feesOption, year);
  // With the exempt option, fees and their contributions join labor income (boxes 32 and 33).
  const feesInLabor = feesOption === 'exempt' ? conceptsTotal(data.fees.concepts) : 0;
  const feesNonTaxableInLabor = feesOption === 'exempt' ? positive(data.fees.nonTaxableIncome) : 0;
  const grossLaborIncome = data.labor.salaries + data.labor.otherPayments + feesInLabor;
  const laborNonTaxableIncome = data.labor.nonTaxableIncome + feesNonTaxableInLabor;
  const capital = computeCapitalIncome(data.capital, year);
  const nonLabor = computeNonLaborIncome(data.nonLabor);
  const pensions = computePensions(data.pensions, year);
  const dividends = computeDividends(
    data.dividends.concepts,
    year,
    isOn('can-dividends') ? adjustments.canDividends : 0,
  );
  const occasionalGains = computeOccasionalGains(data.occasionalGains.concepts, year);

  // Passive income of controlled foreign entities (62, 79); their gross income joins the cap base.
  const eceOn = isOn('ece');
  const eceGross = eceOn
    ? positive(adjustments.ece.capitalIncome) + positive(adjustments.ece.nonLaborIncome)
    : 0;
  const ece = {
    capital: eceOn ? positive(adjustments.ece.capitalIncome - adjustments.ece.capitalCosts) : 0,
    nonLabor: eceOn ? positive(adjustments.ece.nonLaborIncome - adjustments.ece.nonLaborCosts) : 0,
  };

  const generalGrossIncome = grossLaborIncome + fees.grossIncome + capital.grossIncome + nonLabor.grossIncome;
  const grossIncome =
    generalGrossIncome +
    pensions.grossIncome +
    dividends.until2016 +
    dividends.firstSubcedule +
    dividends.secondSubcedule +
    dividends.foreign +
    occasionalGains.grossIncome;
  const laborNetIncome = positive(grossLaborIncome - laborNonTaxableIncome);
  const capitalNetIncome = capital.netIncome + ece.capital;
  const nonLaborNetIncome = nonLabor.netIncome + ece.nonLabor;
  const generalNetIncome = laborNetIncome + fees.netIncome + capitalNetIncome + nonLaborNetIncome;
  const benefitsCapBase = positive(
    generalGrossIncome +
      eceGross -
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
    year,
    data.obligation.vatResponsible,
  );

  const { deductions } = data;
  const benefits = computeGeneralBenefits(
    {
      includeDeductions,
      netIncome: {
        labor: laborNetIncome,
        fees: fees.netIncome,
        capital: capitalNetIncome,
        nonLabor: nonLaborNetIncome,
      },
      grossIncome: {
        labor: grossLaborIncome,
        fees: fees.grossIncome,
        capital: capital.grossIncome,
        nonLabor: nonLabor.grossIncome,
      },
      capBase: benefitsCapBase,
      voluntaryContributions: data.labor.voluntaryContributions,
      housingInterestPaid: deductions.housingInterestPaid,
      prepaidHealthPaid: deductions.prepaidHealthPaid,
      dependents: deductions.dependents,
      severanceReceived: deductions.severanceReceived,
      severanceAverageSalary: deductions.severanceAverageSalary,
      salaries: data.labor.salaries,
      otherLaborExempt: deductions.otherLaborExempt,
      gmfPaid: deductions.gmfPaid,
      icetexInterest: deductions.icetexInterest,
      independentSeverance: deductions.independentSeverance,
      unlimitedExempt: deductions.unlimitedExempt,
    },
    year,
  );
  const { columns } = benefits;
  const labor: LaborIncomeResult = {
    grossIncome: grossLaborIncome,
    nonTaxableIncome: laborNonTaxableIncome,
    netIncome: laborNetIncome,
    housingInterest: benefits.detail.housingInterest,
    dependent: benefits.detail.dependent,
    prepaidHealth: benefits.detail.prepaidHealth,
    housingDeduction: columns.labor.housing,
    otherDeductions: columns.labor.otherDeductions,
    totalDeductions: columns.labor.totalDeductions,
    voluntaryContributions: columns.labor.voluntaryContributions,
    exempt25: benefits.detail.exempt25,
    totalExempt: columns.labor.totalExempt,
    benefitsBeforeCap: benefits.beforeCap,
    benefitsCap: benefits.cap,
    cappedBenefits: benefits.used,
    benefitsExcess: benefits.excess,
    ordinaryNetIncome: positive(laborNetIncome - columns.labor.limited),
  };

  const electronicInvoiceDeduction = includeDeductions
    ? Math.min(
        positive(data.general.electronicInvoicePurchases),
        uvtToPesos(year.general.electronicInvoiceCapUvt, year),
      )
    : 0;
  const limitedBenefits: LimitedBenefits = {
    labor: columns.labor.limited,
    fees: columns.fees.limited,
    capital: columns.capital.limited,
    nonLabor: columns.nonLabor.limited,
  };

  // Losses of earlier years (56, 72, 89), never over each column's ordinary income (54, 70, 87).
  const lossesOn = isOn('losses');
  const feesOrdinaryBefore = positive(fees.netIncome - limitedBenefits.fees);
  const capitalOrdinaryBefore = positive(capitalNetIncome - limitedBenefits.capital);
  const nonLaborOrdinaryBefore = positive(nonLaborNetIncome - limitedBenefits.nonLabor);
  const feesLosses = lossesOn ? Math.min(positive(adjustments.losses.fees), feesOrdinaryBefore) : 0;
  const capitalLosses = lossesOn ? Math.min(positive(adjustments.losses.capital), capitalOrdinaryBefore) : 0;
  const nonLaborLosses = lossesOn
    ? Math.min(positive(adjustments.losses.nonLabor), nonLaborOrdinaryBefore)
    : 0;
  const laborOrdinaryIncome = labor.ordinaryNetIncome;
  const feesOrdinaryIncome = feesOrdinaryBefore - feesLosses;
  const capitalOrdinaryIncome = capitalOrdinaryBefore - capitalLosses;
  const nonLaborOrdinaryIncome = nonLaborOrdinaryBefore - nonLaborLosses;

  // Box 139: outside the 40 % / 1.340 UVT cap, but never above boxes 42 + 57.
  const dependentsAddition = includeDeductions
    ? Math.min(
        uvtToPesos(
          Math.min(positive(Math.floor(deductions.dependents)), year.general.maxAdditionalDependents) *
            year.general.additionalDependentUvt,
          year,
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
  // Box 91 = 41 + 42 + 53 + 57 + 69 + 73 + 86 + 90.
  const generalIncomeAfterLosses = generalNetIncome - feesLosses - capitalLosses - nonLaborLosses;
  const ordinaryIncome = positive(generalIncomeAfterLosses - totalBenefits);
  // Box 94 (2018 and before) cannot touch labor income; 95 up to what is left of 93.
  const until2018 = lossesOn
    ? Math.min(
        positive(adjustments.losses.until2018),
        ordinaryIncome,
        capitalOrdinaryIncome + nonLaborOrdinaryIncome,
      )
    : 0;
  const presumptiveExcess = isOn('presumptive-excess')
    ? Math.min(positive(adjustments.presumptiveExcess), ordinaryIncome - until2018)
    : 0;
  const taxableAdditions = isOn('taxable-additions') ? positive(adjustments.taxableAdditions) : 0;
  const taxableIncome = positive(ordinaryIncome + taxableAdditions - until2018 - presumptiveExcess);

  // Renta presuntiva is 0 % since 2021, so 111 always takes box 97.
  const tableBase = taxableIncome + pensions.taxableIncome + dividends.baseForTable;
  const tableTax = computeTableTax(tableBase, year);
  const totalIncomeTax =
    tableTax.tax + dividends.secondSubceduleTax + dividends.until2016Tax + dividends.foreignTax;

  // Box 122: up to the Colombian tax on the foreign income (its share of box 111).
  const foreignTaxDiscount = isOn('foreign-taxes')
    ? Math.min(
        positive(adjustments.foreignTax.paid),
        tableBase > 0
          ? roundToThousand(
              totalIncomeTax * Math.min(1, positive(adjustments.foreignTax.foreignIncome) / tableBase),
            )
          : 0,
      )
    : 0;
  // Box 123: 25 % of donations plus other discounts, together up to 30 % of box 121 (art. 258).
  const donationsRequested =
    (includeDeductions ? roundToThousand(positive(deductions.donations) * year.discounts.donationRate) : 0) +
    (isOn('other-discounts') ? positive(adjustments.otherDiscounts) : 0);
  const donationsDiscount = Math.min(
    donationsRequested,
    roundToThousand(totalIncomeTax * year.discounts.capRate),
  );
  const taxDiscounts = Math.min(totalIncomeTax, foreignTaxDiscount + donationsDiscount + dividends.discount);
  const netIncomeTax = positive(totalIncomeTax - taxDiscounts);
  const occasionalGainsTax = occasionalGains.tax;
  const occasionalForeignTaxDiscount = isOn('foreign-taxes')
    ? Math.min(positive(adjustments.occasionalForeignTax), occasionalGainsTax)
    : 0;
  const taxDue = netIncomeTax + occasionalGainsTax - occasionalForeignTaxDiscount;

  const advance = computeAdvancePayment(
    {
      filingCount: data.general.filingCount,
      currentNetTax: netIncomeTax,
      previousNetTax: data.general.previousYearNetTax,
      withholdings: data.withholdings,
    },
    year,
  );

  const balanceBeforePenalty =
    taxDue + advance.amount - data.previousYearAdvance - data.previousBalanceInFavor - data.withholdings;
  const lateFiling = computeLateFiling(
    {
      deadline: filingDeadline,
      filingDate: data.filing.date,
      taxDue,
      grossIncome,
      balanceInFavor: positive(-balanceBeforePenalty),
      previousNetAssets: data.filing.previousNetAssets,
      summoned: data.filing.summoned,
      priorLateFiling: data.filing.priorLateFiling,
    },
    year,
  );
  const balance = balanceBeforePenalty + lateFiling.penalty;
  const { voluntaryContribution: contribution } = data.filing;
  const voluntaryContribution =
    contribution.mode === 'amount'
      ? roundToThousand(positive(contribution.value))
      : roundToThousand((positive(balance) * Math.min(100, positive(contribution.value))) / 100);

  return {
    obligation,
    grossAssets,
    totalDebts,
    netAssets: positive(grossAssets - totalDebts),
    grossLaborIncome,
    labor,
    fees,
    feesComparison,
    limitedBenefits,
    benefits,
    compensations: {
      fees: feesLosses,
      capital: capitalLosses,
      nonLabor: nonLaborLosses,
      until2018,
      presumptiveExcess,
    },
    ece,
    taxableAdditions,
    ordinaryIncome,
    capital,
    nonLabor,
    pensions,
    dividends,
    occasionalGains,
    grossIncome,
    generalGrossIncome,
    generalNetIncome: generalIncomeAfterLosses,
    benefitsCapBase,
    electronicInvoiceDeduction,
    dependentsAddition,
    totalBenefits,
    taxableIncome,
    tableBase,
    tableTax,
    totalIncomeTax,
    foreignTaxDiscount,
    donationsDiscount,
    donationsExcess: positive(donationsRequested - donationsDiscount),
    taxDiscounts,
    netIncomeTax,
    occasionalGainsTax,
    occasionalForeignTaxDiscount,
    taxDue,
    withholdings: data.withholdings,
    advance,
    lateFiling,
    voluntaryContribution,
    balance,
    amountToPay: positive(balance),
    amountInFavor: positive(-balance),
  };
};

/** A return with nothing filled in: how every taxable year starts (ADR 0035). */
export const createEmptyDeclaration = (): DeclarationData => ({
  general: { filingCount: 'third-or-more', previousYearNetTax: 0, electronicInvoicePurchases: 0 },
  obligation: { creditCardPurchases: 0, totalPurchases: 0, deposits: 0, vatResponsible: false },
  labor: {
    salaries: 0,
    concepts: [],
    otherPayments: 0,
    nonTaxableIncome: 0,
    voluntaryContributions: 0,
    hasIndependentIncome: false,
  },
  fees: { concepts: [], nonTaxableIncome: 0, costs: 0, option: null },
  capital: { concepts: [], independentContributions: 0, costConcepts: [] },
  nonLabor: { concepts: [], returnConcepts: [], contributionConcepts: [], costConcepts: [] },
  pensions: { concepts: [], nonTaxableIncome: 0, months: 12 },
  dividends: { concepts: [] },
  occasionalGains: { concepts: [] },
  assets: [],
  debts: [],
  deductions: {
    housingInterestPaid: 0,
    prepaidHealthPaid: 0,
    dependents: 0,
    severanceReceived: 0,
    severanceAverageSalary: null,
    otherLaborExempt: 0,
    unlimitedExempt: { amount: 0, column: 'labor' },
    gmfPaid: 0,
    icetexInterest: 0,
    independentSeverance: 0,
    donations: 0,
  },
  adjustments: createEmptyAdjustments(),
  filing: {
    date: null,
    priorLateFiling: 'none',
    summoned: false,
    previousNetAssets: 0,
    voluntaryContribution: { mode: 'amount', value: 0 },
  },
  withholdings: 0,
  previousYearAdvance: 0,
  previousBalanceInFavor: 0,
  refundPreference: 'refund',
});

/** «Otros ajustes» with every switch off. */
export const createEmptyAdjustments = (): Adjustments => ({
  enabled: [],
  losses: { fees: 0, capital: 0, nonLabor: 0, until2018: 0 },
  presumptiveExcess: 0,
  taxableAdditions: 0,
  ece: { capitalIncome: 0, capitalCosts: 0, nonLaborIncome: 0, nonLaborCosts: 0 },
  foreignTax: { paid: 0, foreignIncome: 0 },
  occasionalForeignTax: 0,
  canDividends: 0,
  otherDiscounts: 0,
});
