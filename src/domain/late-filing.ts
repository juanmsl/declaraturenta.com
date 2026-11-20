import type { TaxYearConfig } from './tax-years';
import { roundToThousand } from './uvt';

/** Whether the person filed late before, for the art. 640 reduction. */
export type PriorLateFiling = 'none' | 'more-than-a-year' | 'within-a-year';

export type LateFilingInput = {
  /** ISO dates (YYYY-MM-DD). */
  deadline: string | null;
  filingDate: string | null;
  /** Impuesto a cargo (box 129). */
  taxDue: number;
  /** Gross income of the year (all schedules and occasional gains). */
  grossIncome: number;
  /** Balance in favor before the penalty. */
  balanceInFavor: number;
  /** Net assets of last year's return, only used without tax and without income. */
  previousNetAssets: number;
  /** The DIAN sent a summons to file (emplazamiento para declarar, art. 642 E.T.). */
  summoned: boolean;
  priorLateFiling: PriorLateFiling;
};

export type LateFiling = {
  /** Months or fractions of month after the deadline; 0 when on time. */
  months: number;
  /** What the penalty is computed on. */
  base: 'tax' | 'income' | 'assets' | null;
  /** Penalty before the art. 640 reduction and the minimum. */
  fullPenalty: number;
  /** Share kept after the art. 640 reduction (1 = no reduction). */
  reduction: number;
  /** True when the minimum of 10 UVT applied. */
  minimumApplied: boolean;
  /** Box 135. */
  penalty: number;
};

const NONE: LateFiling = {
  months: 0,
  base: null,
  fullPenalty: 0,
  reduction: 1,
  minimumApplied: false,
  penalty: 0,
};

/**
 * Months or fractions of calendar month between the deadline and the filing date
 * ("por cada mes o fracción de mes calendario de retardo", art. 641 E.T.).
 */
export const lateMonths = (deadline: string, filingDate: string): number => {
  if (filingDate <= deadline) return 0;
  const parts = (date: string) => {
    const [y = 0, m = 0, d = 0] = date.split('-').map(Number);
    return [y, m, d] as const;
  };
  const [dy, dm, dd] = parts(deadline);
  const [fy, fm, fd] = parts(filingDate);
  const months = (fy - dy) * 12 + (fm - dm) + (fd > dd ? 1 : 0);
  return Math.max(1, months);
};

/**
 * Late filing penalty (box 135): 5 % of the tax due per month or fraction, up to 100 %; without
 * tax, 0,5 % of gross income (up to 5 %, twice the balance in favor or 2.500 UVT); without income,
 * 1 % of last year's net assets. After a summons the rates double (art. 642). The person can reduce
 * it to 50 % or 75 % (art. 640) when they did not file late before and there was no summons. Never
 * below 10 UVT of the filing year (art. 639).
 */
export const computeLateFiling = (input: LateFilingInput, year: TaxYearConfig): LateFiling => {
  if (!input.deadline || !input.filingDate) return NONE;
  const months = lateMonths(input.deadline, input.filingDate);
  if (months === 0) return NONE;

  const rates = input.summoned ? year.penalties.summoned : year.penalties.voluntary;
  const otherCap =
    input.balanceInFavor > 0
      ? input.balanceInFavor * rates.balanceMultiple
      : Math.round(rates.capUvt * year.filingYearUvt);

  let base: LateFiling['base'];
  let fullPenalty: number;
  if (input.taxDue > 0) {
    base = 'tax';
    fullPenalty = Math.min(input.taxDue * rates.taxRate * months, input.taxDue * rates.taxCap);
  } else if (input.grossIncome > 0) {
    base = 'income';
    fullPenalty = Math.min(
      input.grossIncome * rates.incomeRate * months,
      input.grossIncome * rates.incomeCap,
      otherCap,
    );
  } else {
    base = 'assets';
    const assets = Math.max(0, input.previousNetAssets);
    fullPenalty = Math.min(assets * rates.assetsRate * months, assets * rates.assetsCap, otherCap);
  }

  const reduction = input.summoned
    ? 1
    : input.priorLateFiling === 'none'
      ? year.penalties.reductionNoRepeatTwoYears
      : input.priorLateFiling === 'more-than-a-year'
        ? year.penalties.reductionNoRepeatOneYear
        : 1;
  const minimum = roundToThousand(year.penalties.minimumUvt * year.filingYearUvt);
  const reduced = roundToThousand(fullPenalty * reduction);
  return {
    months,
    base,
    fullPenalty: roundToThousand(fullPenalty),
    reduction,
    minimumApplied: reduced < minimum,
    penalty: Math.max(reduced, minimum),
  };
};
