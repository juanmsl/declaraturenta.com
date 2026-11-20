import { uvtToPesos } from './tax-years';
import type { TaxYearConfig } from './tax-years';

/** The four income columns of the general schedule, in the DIAN order. */
export const GENERAL_COLUMNS = ['labor', 'fees', 'capital', 'nonLabor'] as const;
export type GeneralColumn = (typeof GENERAL_COLUMNS)[number];

type ByColumn<T> = Record<GeneralColumn, T>;

/** Exempt income and deductions of one column (e.g. boxes 35–41 for labor). */
export type ColumnBenefits = {
  /** Renta líquida the benefits apply to (34, 46, 61 + 62, 78 + 79). */
  netIncome: number;
  /** AFC, FVP and AVC contributions (35, 47, 63, 80). */
  voluntaryContributions: number;
  /** Other exempt income (36, 48, 64, 81), the unlimited part included. */
  otherExempt: number;
  /** Part of `otherExempt` without the 40 % cap. */
  unlimitedExempt: number;
  /** Total exempt (37, 49, 65, 82). */
  totalExempt: number;
  /** Housing interest (38, 50, 66, 83). */
  housing: number;
  /** Other deductions (39, 51, 67, 84). */
  otherDeductions: number;
  /** Total deductions (40, 52, 68, 85). */
  totalDeductions: number;
  /** Limited benefits that reduce this column (41, 53, 69, 86). */
  limited: number;
};

export type GeneralBenefitsInput = {
  includeDeductions: boolean;
  /** Renta líquida of each column before benefits. */
  netIncome: ByColumn<number>;
  /** Gross income of each column (32, 43, 58, 74). */
  grossIncome: ByColumn<number>;
  /** Base of the 40 % cap: gross income minus non-taxable income, ECE income included. */
  capBase: number;
  voluntaryContributions: number;
  housingInterestPaid: number;
  prepaidHealthPaid: number;
  dependents: number;
  severanceReceived: number;
  /** Average monthly salary of the last six months; null uses salaries ÷ 12. */
  severanceAverageSalary: number | null;
  /** Salaries of the year, to suggest the average monthly salary. */
  salaries: number;
  otherLaborExempt: number;
  gmfPaid: number;
  icetexInterest: number;
  independentSeverance: number;
  unlimitedExempt: { amount: number; column: GeneralColumn };
};

export type GeneralBenefits = {
  columns: ByColumn<ColumnBenefits>;
  /** Detail of the labor and generic benefits, for the screens. */
  detail: {
    voluntaryContributionsAllowed: number;
    voluntaryContributionsCap: number;
    dependent: number;
    prepaidHealth: number;
    housingInterest: number;
    severanceExemptShare: number;
    severanceAverageSalary: number;
    severanceExempt: number;
    otherLaborExempt: number;
    exempt25: number;
    gmf: number;
    icetex: number;
    independentSeverance: number;
    unlimitedExempt: number;
  };
  /** Benefits subject to the cap, before it. */
  beforeCap: number;
  /** Lower of 40 % of the cap base and 1.340 UVT. */
  cap: number;
  /** Limited benefits used: 41 + 53 + 69 + 86. */
  used: number;
  /** Benefits that could not be used (cap or not enough income). */
  excess: number;
};

const positive = (value: number) => Math.max(0, value);

/** Exempt share of severance pay by average monthly salary (art. 206 num. 4 E.T.). */
export const severanceExemptShare = (averageMonthlySalary: number, year: TaxYearConfig): number => {
  const salaryUvt = averageMonthlySalary / year.uvt;
  for (const [upToUvt, share] of year.labor.severanceExemptBrackets) {
    if (salaryUvt <= upToUvt) return share;
  }
  return 0;
};

const emptyColumn = (netIncome: number): ColumnBenefits => ({
  netIncome,
  voluntaryContributions: 0,
  otherExempt: 0,
  unlimitedExempt: 0,
  totalExempt: 0,
  housing: 0,
  otherDeductions: 0,
  totalDeductions: 0,
  limited: 0,
});

/** First column with income, in the DIAN order; labor when none has income. */
const firstWithIncome = (netIncome: ByColumn<number>, preferred: GeneralColumn = 'labor'): GeneralColumn =>
  netIncome[preferred] > 0 ? preferred : (GENERAL_COLUMNS.find(column => netIncome[column] > 0) ?? preferred);

/**
 * Exempt income and deductions of the general schedule, column by column, and the limited amounts
 * of boxes 41, 53, 69 and 86 (DIAN instructions, form 210):
 * - AFC, FVP and AVC: up to 30 % of gross income and 3.800 UVT, in the column order.
 * - Labor: severance pay (art. 206 num. 4), other exempt labor income, housing interest, dependent,
 *   prepaid health and the 25 % (art. 206 num. 10), computed last and never over severance pay.
 * - GMF (50 %) and ICETEX interest go to the first column with income; independent severance
 *   contributions to fees when they have their own column.
 * - Everything but the unlimited exempt income is capped at 40 % of the cap base and 1.340 UVT; the
 *   total is distributed labor → fees → capital → non-labor, never over each column's income nor
 *   its own benefits.
 */
export const computeGeneralBenefits = (input: GeneralBenefitsInput, year: TaxYearConfig): GeneralBenefits => {
  const { labor: laborLimits, benefits: limits, general } = year;
  const columns: ByColumn<ColumnBenefits> = {
    labor: emptyColumn(positive(input.netIncome.labor)),
    fees: emptyColumn(positive(input.netIncome.fees)),
    capital: emptyColumn(positive(input.netIncome.capital)),
    nonLabor: emptyColumn(positive(input.netIncome.nonLabor)),
  };
  const on = input.includeDeductions;
  const totalGross = GENERAL_COLUMNS.reduce(
    (total, column) => total + positive(input.grossIncome[column]),
    0,
  );

  // AFC, FVP and AVC (35, 47, 63, 80).
  const voluntaryContributionsCap = Math.min(
    Math.round(totalGross * limits.voluntaryContributionsRate),
    uvtToPesos(limits.voluntaryContributionsUvt, year),
  );
  const voluntaryContributionsAllowed = Math.min(
    positive(input.voluntaryContributions),
    voluntaryContributionsCap,
  );
  let toAllocate = voluntaryContributionsAllowed;
  for (const column of GENERAL_COLUMNS) {
    const taken = Math.min(toAllocate, columns[column].netIncome);
    columns[column].voluntaryContributions = taken;
    toAllocate -= taken;
  }

  // Deductions.
  const housingInterest = on
    ? Math.min(positive(input.housingInterestPaid), uvtToPesos(laborLimits.housingInterestUvt, year))
    : 0;
  const dependent =
    on && input.dependents > 0
      ? Math.min(
          Math.round(positive(input.grossIncome.labor) * laborLimits.dependentRate),
          uvtToPesos(laborLimits.dependentUvt, year),
        )
      : 0;
  const prepaidHealth = on
    ? Math.min(positive(input.prepaidHealthPaid), uvtToPesos(laborLimits.prepaidHealthUvt, year))
    : 0;
  const gmf = on ? Math.round(positive(input.gmfPaid) * limits.gmfRate) : 0;
  const icetex = on
    ? Math.min(positive(input.icetexInterest), uvtToPesos(limits.icetexInterestUvt, year))
    : 0;
  const severanceColumn: GeneralColumn = input.grossIncome.fees > 0 ? 'fees' : 'labor';
  const independentSeverance = on
    ? Math.min(
        positive(input.independentSeverance),
        uvtToPesos(limits.independentSeveranceUvt, year),
        Math.round(positive(input.grossIncome[severanceColumn]) * limits.independentSeveranceShare),
      )
    : 0;

  columns[firstWithIncome(input.netIncome)].housing += housingInterest;
  columns.labor.otherDeductions += dependent + prepaidHealth;
  columns[firstWithIncome(input.netIncome)].otherDeductions += gmf + icetex;
  columns[severanceColumn].otherDeductions += independentSeverance;

  // Exempt labor income.
  const severanceReceived = positive(input.severanceReceived);
  const severanceAverageSalary = input.severanceAverageSalary ?? Math.round(positive(input.salaries) / 12);
  const severanceShare = severanceReceived > 0 ? severanceExemptShare(severanceAverageSalary, year) : 0;
  const severanceExempt = on ? Math.round(severanceReceived * severanceShare) : 0;
  const otherLaborExempt = on ? positive(input.otherLaborExempt) : 0;
  const unlimitedColumn = input.unlimitedExempt.column;
  const unlimitedExempt = on
    ? Math.min(positive(input.unlimitedExempt.amount), columns[unlimitedColumn].netIncome)
    : 0;
  columns[unlimitedColumn].unlimitedExempt = unlimitedExempt;

  for (const column of GENERAL_COLUMNS) {
    const item = columns[column];
    item.totalDeductions = item.housing + item.otherDeductions;
  }

  // 25 % (art. 206 num. 10), after everything else and never over severance pay.
  const exempt25 = Math.min(
    Math.round(
      positive(
        columns.labor.netIncome -
          (on ? severanceReceived : 0) -
          columns.labor.totalDeductions -
          columns.labor.voluntaryContributions -
          otherLaborExempt -
          (unlimitedColumn === 'labor' ? unlimitedExempt : 0),
      ) * laborLimits.exempt25Rate,
    ),
    uvtToPesos(laborLimits.exempt25Uvt, year),
  );
  // Like before, the 25 % shows in the estimate before the deductions step too.
  const laborExempt25 = exempt25;
  columns.labor.otherExempt += severanceExempt + otherLaborExempt + laborExempt25;

  for (const column of GENERAL_COLUMNS) {
    const item = columns[column];
    item.otherExempt += item.unlimitedExempt;
    item.totalExempt = item.voluntaryContributions + item.otherExempt;
  }

  // Cap and distribution (41, 53, 69, 86).
  const limitedOf = (item: ColumnBenefits) => item.totalExempt + item.totalDeductions - item.unlimitedExempt;
  const beforeCap = GENERAL_COLUMNS.reduce((total, column) => total + limitedOf(columns[column]), 0);
  const cap = Math.min(
    Math.round(positive(input.capBase) * general.benefitsCapRate),
    uvtToPesos(general.benefitsCapUvt, year),
  );
  let remaining = Math.min(beforeCap, cap);
  let used = 0;
  for (const column of GENERAL_COLUMNS) {
    const item = columns[column];
    const room = positive(item.netIncome - item.unlimitedExempt);
    const taken = Math.min(remaining, room, limitedOf(item));
    remaining -= taken;
    used += taken;
    item.limited = taken + item.unlimitedExempt;
  }

  return {
    columns,
    detail: {
      voluntaryContributionsAllowed,
      voluntaryContributionsCap,
      dependent,
      prepaidHealth,
      housingInterest,
      severanceExemptShare: severanceShare,
      severanceAverageSalary,
      severanceExempt,
      otherLaborExempt,
      exempt25: laborExempt25,
      gmf,
      icetex,
      independentSeverance,
      unlimitedExempt,
    },
    beforeCap,
    cap,
    used,
    excess: positive(beforeCap - used),
  };
};
