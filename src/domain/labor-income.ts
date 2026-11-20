import { uvtToPesos } from './tax-years';
import type { TaxYearConfig } from './tax-years';

/**
 * General schedule (cédula general), labor income (rentas de trabajo). Limits come from the
 * taxable year's configuration:
 * - Housing loan interest (art. 119 E.T.).
 * - Economic dependent: a share of gross labor income, up to a cap (art. 387 E.T.).
 * - Prepaid health, up to a yearly cap (art. 387 E.T.).
 * - Exempt 25 % of labor payments, up to a yearly cap (art. 206 num. 10 E.T.), computed after
 *   non-taxable income, deductions and other exempt income.
 * - Exempt income plus deductions are capped at 40 % of the general schedule's gross income minus
 *   its non-taxable income, up to a cap in UVT (art. 336 E.T., DIAN instructions of box 92).
 */
export type LaborIncomeInput = {
  /** Gross labor income (box 32). */
  grossIncome: number;
  /** Non-taxable income: mandatory pension, health and solidarity fund contributions (box 33). */
  nonTaxableIncome: number;
  /** Voluntary AFC, FVP and AVC contributions treated as exempt (box 35). Limits not modeled yet. */
  voluntaryContributions: number;
  housingInterestPaid: number;
  prepaidHealthPaid: number;
  hasDependent: boolean;
  /** False until the user reaches the deductions step, so the estimate excludes them. */
  includeDeductions: boolean;
  /**
   * Base of the 40 % cap of art. 336 E.T. for the whole general schedule: gross income minus
   * non-taxable income of every column (costs are not subtracted). Defaults to the labor net income.
   */
  capBase?: number;
};

export type LaborIncomeResult = {
  grossIncome: number;
  nonTaxableIncome: number;
  /** Renta líquida (box 34). */
  netIncome: number;
  housingInterest: number;
  dependent: number;
  prepaidHealth: number;
  /** Housing interest (box 38). */
  housingDeduction: number;
  /** Dependent + prepaid health (box 39). */
  otherDeductions: number;
  /** Box 40. */
  totalDeductions: number;
  /** Box 35. */
  voluntaryContributions: number;
  /** 25 % exempt labor income (box 36). */
  exempt25: number;
  /** Box 37. */
  totalExempt: number;
  /** Deductions + exempt income before the cap. */
  benefitsBeforeCap: number;
  /** Cap: lower of 40 % of the cap base and 1.340 UVT. */
  benefitsCap: number;
  /** Box 41. */
  cappedBenefits: number;
  /** Benefits that could not be used because of the cap. */
  benefitsExcess: number;
  /** Renta líquida ordinaria (box 42). */
  ordinaryNetIncome: number;
};

const nonNegative = (value: number) => Math.max(0, value);

export const computeLaborIncome = (input: LaborIncomeInput, year: TaxYearConfig): LaborIncomeResult => {
  const { labor, general } = year;
  const netIncome = nonNegative(input.grossIncome - input.nonTaxableIncome);

  const housingInterest = input.includeDeductions
    ? Math.min(nonNegative(input.housingInterestPaid), uvtToPesos(labor.housingInterestUvt, year))
    : 0;
  const dependent =
    input.includeDeductions && input.hasDependent
      ? Math.min(Math.round(input.grossIncome * labor.dependentRate), uvtToPesos(labor.dependentUvt, year))
      : 0;
  const prepaidHealth = input.includeDeductions
    ? Math.min(nonNegative(input.prepaidHealthPaid), uvtToPesos(labor.prepaidHealthUvt, year))
    : 0;

  const otherDeductions = dependent + prepaidHealth;
  const totalDeductions = housingInterest + otherDeductions;
  const voluntaryContributions = nonNegative(input.voluntaryContributions);

  const exempt25 = Math.min(
    Math.round(nonNegative(netIncome - totalDeductions - voluntaryContributions) * labor.exempt25Rate),
    uvtToPesos(labor.exempt25Uvt, year),
  );
  const totalExempt = voluntaryContributions + exempt25;

  const benefitsBeforeCap = totalExempt + totalDeductions;
  const benefitsCap = Math.min(
    Math.round((input.capBase ?? netIncome) * general.benefitsCapRate),
    uvtToPesos(general.benefitsCapUvt, year),
  );
  const cappedBenefits = Math.min(benefitsBeforeCap, benefitsCap);

  return {
    grossIncome: input.grossIncome,
    nonTaxableIncome: input.nonTaxableIncome,
    netIncome,
    housingInterest,
    dependent,
    prepaidHealth,
    housingDeduction: housingInterest,
    otherDeductions,
    totalDeductions,
    voluntaryContributions,
    exempt25,
    totalExempt,
    benefitsBeforeCap,
    benefitsCap,
    cappedBenefits,
    benefitsExcess: benefitsBeforeCap - cappedBenefits,
    ordinaryNetIncome: nonNegative(netIncome - cappedBenefits),
  };
};
