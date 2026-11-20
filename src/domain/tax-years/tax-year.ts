/** Marginal tax table for residents (art. 241 E.T.), in UVT. */
export type TaxBracket = {
  fromUvt: number;
  /** `null` for the open top bracket. */
  toUvt: number | null;
  /** Marginal rate as a fraction (0.28 = 28 %). */
  rate: number;
  /** Fixed tax in UVT added on top of the marginal part. */
  fixedUvt: number;
};

/** How many times the taxpayer has filed income tax, including this return. */
export type FilingCount = 'first' | 'second' | 'third-or-more';

/**
 * Everything that changes from one taxable year to another: UVT, tables, caps, rates and the
 * filing calendar (ADR 0034). The engine and the screens read the selected year's configuration;
 * nothing year-specific lives elsewhere.
 */
export type TaxYearConfig = {
  /** Taxable year (año gravable). */
  year: number;
  /** Calendar year in which it is filed. */
  filingYear: number;
  /** UVT of the taxable year, in pesos, and the rule that set it. */
  uvt: number;
  uvtSource: string;
  /** UVT of the filing year: late filing penalties use it (art. 639 E.T.). */
  filingYearUvt: number;
  filingYearUvtSource: string;
  /** Art. 241 E.T. table for the general, pensions and dividends schedules (box 116). */
  incomeTaxBrackets: readonly TaxBracket[];
  /** Art. 241 table in force until 2016, for dividends of 2016 and earlier (box 119). */
  until2016Brackets: readonly TaxBracket[];
  /** Filing tests (arts. 592, 593 and 594-3 E.T.), in UVT. */
  filingTestsUvt: {
    grossAssets: number;
    grossIncome: number;
    creditCardPurchases: number;
    totalPurchases: number;
    deposits: number;
  };
  /** General schedule caps and rates. */
  general: {
    /** 40 % cap of exempt income and deductions, up to this many UVT (art. 336 E.T.). */
    benefitsCapRate: number;
    benefitsCapUvt: number;
    /** Box 28: 1 % of purchases with electronic invoice, up to this many UVT. */
    electronicInvoiceRate: number;
    electronicInvoiceCapUvt: number;
    /** Box 139: UVT per dependent, up to a number of dependents. */
    additionalDependentUvt: number;
    maxAdditionalDependents: number;
    /** Inflationary component of financial yields (box 59), and the decree that set it. */
    inflationComponentRate: number;
    inflationComponentSource: string;
    /** Box 140: indicative cap of costs over fees (art. 336-1 E.T.). */
    feesIndicativeCostsRate: number;
  };
  /** Labor income limits. */
  labor: {
    housingInterestUvt: number;
    dependentRate: number;
    dependentUvt: number;
    prepaidHealthUvt: number;
    exempt25Rate: number;
    exempt25Uvt: number;
    /**
     * Exempt share of severance pay and its interest by average monthly salary in UVT
     * (art. 206 num. 4 E.T.): each entry is [salary up to, exempt share]; above the last, 0.
     */
    severanceExemptBrackets: readonly (readonly [number, number])[];
  };
  /** Other deductions and exempt income of the general schedule. */
  benefits: {
    /** Voluntary AFC, FVP and AVC contributions: share of gross income and cap (arts. 126-1, 126-4). */
    voluntaryContributionsRate: number;
    voluntaryContributionsUvt: number;
    /** Deductible share of the GMF paid (art. 115 E.T.). */
    gmfRate: number;
    /** ICETEX loan interest cap (art. 119 E.T.). */
    icetexInterestUvt: number;
    /** Severance contributions of independents: cap and share of income (art. 126-1 E.T.). */
    independentSeveranceUvt: number;
    independentSeveranceShare: number;
  };
  /** Tax discounts (box 123). */
  discounts: {
    /** Donations to non-profits of the special regime (art. 257 E.T.). */
    donationRate: number;
    /** Arts. 256, 257 and 257-1 together cannot pass this share of the income tax (art. 258 E.T.). */
    capRate: number;
  };
  /** Late filing (arts. 639, 640, 641 and 642 E.T.). */
  penalties: {
    minimumUvt: number;
    /** Per month or fraction of month: [over tax, over gross income, over last year's net assets]. */
    voluntary: PenaltyRates;
    summoned: PenaltyRates;
    /** Art. 640 reductions when the taxpayer liquidates the penalty. */
    reductionNoRepeatTwoYears: number;
    reductionNoRepeatOneYear: number;
  };
  pensions: { exemptMonthlyUvt: number };
  dividends: {
    secondSubceduleRate: number;
    foreignRate: number;
    discountFromUvt: number;
    discountRate: number;
  };
  occasionalGains: {
    rate: number;
    lotteryRate: number;
    homeSaleExemptUvt: number;
    inheritedHomeExemptUvt: number;
    inheritedRealEstateExemptUvt: number;
    inheritanceExemptUvt: number;
    lifeInsuranceExemptUvt: number;
    giftExemptRate: number;
    giftExemptCapUvt: number;
  };
  /** Share of the net tax used for next year's advance (art. 807 E.T.). */
  advanceRates: Record<FilingCount, number>;
  /**
   * Filing calendar for personas naturales by the last two digits of the NIT: each entry is
   * [first ending, ISO date] and covers that ending and the next one ("00" goes with "99").
   */
  filingCalendar: readonly (readonly [number, string])[];
  filingCalendarSource: string;
};

/** Late filing rates of art. 641 (voluntary) or art. 642 (after a summons). */
export type PenaltyRates = {
  taxRate: number;
  taxCap: number;
  incomeRate: number;
  incomeCap: number;
  assetsRate: number;
  assetsCap: number;
  /** Times the balance in favor, as a cap when there is no tax. */
  balanceMultiple: number;
  /** Cap in UVT when there is no tax nor balance in favor. */
  capUvt: number;
};

export const uvtToPesos = (uvt: number, year: TaxYearConfig): number => Math.round(uvt * year.uvt);
