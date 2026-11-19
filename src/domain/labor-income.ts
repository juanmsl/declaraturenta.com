import { UVT_2025, uvtToPesos } from './uvt';

/**
 * General schedule (cédula general), labor income (rentas de trabajo) of an employee.
 * Limits for taxable year 2025:
 * - Housing loan interest: up to 1.200 UVT a year (art. 119 E.T.).
 * - Economic dependent: 10 % of gross labor income, up to 384 UVT a year (art. 387 E.T.).
 * - Prepaid health: up to 16 UVT a month, 192 UVT a year (art. 387 E.T.).
 * - Exempt 25 % of labor payments, up to 790 UVT a year (art. 206 num. 10 E.T., Ley 2277 de 2022),
 *   computed after non-taxable income, deductions and other exempt income.
 * - Exempt income plus deductions are capped at 40 % of net income, up to 1.340 UVT (art. 336 E.T.).
 */
export const LABOR_LIMITS_UVT = {
  housingInterest: 1200,
  dependent: 384,
  prepaidHealth: 192,
  exempt25: 790,
  benefitsCap: 1340,
} as const;

export const DEPENDENT_RATE = 0.1;
export const EXEMPT_LABOR_RATE = 0.25;
export const BENEFITS_CAP_RATE = 0.4;

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
  /** Cap: lower of 40 % of net income and 1.340 UVT. */
  benefitsCap: number;
  /** Box 41. */
  cappedBenefits: number;
  /** Benefits that could not be used because of the cap. */
  benefitsExcess: number;
  /** Renta líquida ordinaria (box 42). */
  ordinaryNetIncome: number;
};

const nonNegative = (value: number) => Math.max(0, value);

export const computeLaborIncome = (
  input: LaborIncomeInput,
  uvtValue: number = UVT_2025,
): LaborIncomeResult => {
  const netIncome = nonNegative(input.grossIncome - input.nonTaxableIncome);

  const housingInterest = input.includeDeductions
    ? Math.min(nonNegative(input.housingInterestPaid), uvtToPesos(LABOR_LIMITS_UVT.housingInterest, uvtValue))
    : 0;
  const dependent =
    input.includeDeductions && input.hasDependent
      ? Math.min(
          Math.round(input.grossIncome * DEPENDENT_RATE),
          uvtToPesos(LABOR_LIMITS_UVT.dependent, uvtValue),
        )
      : 0;
  const prepaidHealth = input.includeDeductions
    ? Math.min(nonNegative(input.prepaidHealthPaid), uvtToPesos(LABOR_LIMITS_UVT.prepaidHealth, uvtValue))
    : 0;

  const otherDeductions = dependent + prepaidHealth;
  const totalDeductions = housingInterest + otherDeductions;
  const voluntaryContributions = nonNegative(input.voluntaryContributions);

  const exempt25 = Math.min(
    Math.round(nonNegative(netIncome - totalDeductions - voluntaryContributions) * EXEMPT_LABOR_RATE),
    uvtToPesos(LABOR_LIMITS_UVT.exempt25, uvtValue),
  );
  const totalExempt = voluntaryContributions + exempt25;

  const benefitsBeforeCap = totalExempt + totalDeductions;
  const benefitsCap = Math.min(
    Math.round(netIncome * BENEFITS_CAP_RATE),
    uvtToPesos(LABOR_LIMITS_UVT.benefitsCap, uvtValue),
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
