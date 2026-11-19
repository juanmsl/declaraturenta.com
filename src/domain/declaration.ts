import { computeAdvancePayment } from './advance-payment';
import type { AdvancePayment, FilingCount } from './advance-payment';
import { evaluateFilingObligation } from './filing-obligation';
import type { FilingObligation } from './filing-obligation';
import { computeTableTax } from './income-tax-table';
import type { TableTax } from './income-tax-table';
import { computeLaborIncome } from './labor-income';
import type { LaborIncomeResult } from './labor-income';
import { UVT_2025, uvtToPesos } from './uvt';

/** Box 28 cap: 1 % of purchases with electronic invoice, up to 240 UVT (art. 336 E.T.). */
export const ELECTRONIC_INVOICE_CAP_UVT = 240;
/** Box 139: 72 UVT per dependent, up to 4 (art. 336 E.T.). Boxes 77–139 still to validate. */
export const ADDITIONAL_DEPENDENT_UVT = 72;
export const MAX_ADDITIONAL_DEPENDENTS = 4;

/** Where a value comes from: the DIAN exogenous report, the user, or our calculation. */
export type ValueOrigin = 'exogenous' | 'user';

/** One labor payment that adds up to box 32 (e.g. salary, bonus). */
export type LaborConcept = {
  id: string;
  label: string;
  entity: string;
  amount: number;
  origin: ValueOrigin;
  /** What the exogenous report said, when the user changed it. */
  exogenousAmount?: number;
};

export type AssetKind = 'real-estate' | 'bank-account' | 'vehicle' | 'investment' | 'other';

export type Asset = {
  id: string;
  kind: AssetKind;
  label: string;
  detail: string;
  amount: number;
  origin: ValueOrigin;
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
  assets: Asset[];
  debts: Debt[];
  deductions: {
    housingInterestPaid: number;
    prepaidHealthPaid: number;
    hasDependent: boolean;
    /** Box 138: dependents for the additional 72 UVT each (box 139). Rule to validate. */
    additionalDependents: number;
  };
  /** Withholdings of the taxable year (box 132). */
  withholdings: number;
  /** Advance paid last year for this year (box 130). */
  previousYearAdvance: number;
  /** Balance in favor from last year not refunded (box 131). */
  previousBalanceInFavor: number;
  refundPreference: 'refund' | 'next-year';
};

export type DeclarationResult = {
  obligation: FilingObligation;
  grossAssets: number;
  totalDebts: number;
  netAssets: number;
  /** Box 32: salaries + other labor payments. */
  grossLaborIncome: number;
  labor: LaborIncomeResult;
  /** Box 28 after its cap. */
  electronicInvoiceDeduction: number;
  /** Box 139: 72 UVT per additional dependent, up to 4. */
  dependentsAddition: number;
  /** Box 92: exempt income and deductions that reduce net income. */
  totalBenefits: number;
  /** Renta líquida gravable (boxes 97 and 111). */
  taxableIncome: number;
  tableTax: TableTax;
  /** Impuesto neto de renta (box 126). */
  netIncomeTax: number;
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

export type ComputeOptions = {
  /** Include deductions and their exempt-income effect (false before the deductions step). */
  includeDeductions?: boolean;
  uvtValue?: number;
};

/** Computes every figure of the return from the user's data. Pure function. */
export const computeDeclaration = (
  data: DeclarationData,
  { includeDeductions = true, uvtValue = UVT_2025 }: ComputeOptions = {},
): DeclarationResult => {
  const grossAssets = sum(data.assets.map(asset => asset.amount));
  const totalDebts = sum(data.debts.map(debt => debt.amount));
  const grossLaborIncome = data.labor.salaries + data.labor.otherPayments;

  const obligation = evaluateFilingObligation(
    {
      grossAssets,
      grossIncome: grossLaborIncome,
      creditCardPurchases: data.obligation.creditCardPurchases,
      totalPurchases: data.obligation.totalPurchases,
      deposits: data.obligation.deposits,
    },
    uvtValue,
  );

  const labor = computeLaborIncome(
    {
      grossIncome: grossLaborIncome,
      nonTaxableIncome: data.labor.nonTaxableIncome,
      voluntaryContributions: data.labor.voluntaryContributions,
      housingInterestPaid: data.deductions.housingInterestPaid,
      prepaidHealthPaid: data.deductions.prepaidHealthPaid,
      hasDependent: data.deductions.hasDependent,
      includeDeductions,
    },
    uvtValue,
  );

  const electronicInvoiceDeduction = includeDeductions
    ? Math.min(
        Math.max(0, data.general.electronicInvoicePurchases),
        uvtToPesos(ELECTRONIC_INVOICE_CAP_UVT, uvtValue),
      )
    : 0;
  const dependentsAddition = includeDeductions
    ? uvtToPesos(
        Math.min(Math.max(0, Math.floor(data.deductions.additionalDependents)), MAX_ADDITIONAL_DEPENDENTS) *
          ADDITIONAL_DEPENDENT_UVT,
        uvtValue,
      )
    : 0;
  const totalBenefits = labor.cappedBenefits + electronicInvoiceDeduction + dependentsAddition;
  const taxableIncome = Math.max(0, labor.netIncome - totalBenefits);
  const tableTax = computeTableTax(taxableIncome, uvtValue);
  const netIncomeTax = tableTax.tax;
  const taxDue = netIncomeTax;

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
    electronicInvoiceDeduction,
    dependentsAddition,
    totalBenefits,
    taxableIncome,
    tableTax,
    netIncomeTax,
    taxDue,
    withholdings: data.withholdings,
    advance,
    balance,
    amountToPay: Math.max(0, balance),
    amountInFavor: Math.max(0, -balance),
  };
};
