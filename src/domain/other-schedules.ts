import { computeTableTax } from './income-tax-table';
import { uvtToPesos } from './tax-years';
import type { TaxYearConfig } from './tax-years';
import { pesosToUvt, roundToThousand } from './uvt';

/** Where a value comes from: the DIAN exogenous report or the user. */
type Origin = 'exogenous' | 'user';

const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);
const positive = (value: number) => Math.max(0, value);

// ---------------------------------------------------------------------------------------------
// Cédula de pensiones (boxes 99–103)
// ---------------------------------------------------------------------------------------------

export type PensionConcept = {
  id: string;
  label: string;
  entity: string;
  amount: number;
  origin: Origin;
  exogenousAmount?: number;
};

export type PensionData = {
  /** Box 99: pensions from Colombia and abroad. */
  concepts: PensionConcept[];
  /** Box 100: mandatory health and solidarity fund contributions withheld from the pension. */
  nonTaxableIncome: number;
  /** Months of pension received in the year (12 by default). */
  months: number;
};

export type PensionResult = {
  /** Box 99. */
  grossIncome: number;
  /** Box 100. */
  nonTaxableIncome: number;
  /** Box 101 = 99 − 100. */
  netIncome: number;
  /** Box 102: up to the year's monthly UVT per month of pension (art. 206 num. 5 E.T.). */
  exemptIncome: number;
  /** Box 103 = 101 − 102. */
  taxableIncome: number;
};

export const computePensions = (data: PensionData, year: TaxYearConfig): PensionResult => {
  const grossIncome = sum(data.concepts.map(concept => concept.amount));
  const nonTaxableIncome = Math.min(positive(data.nonTaxableIncome), grossIncome);
  const netIncome = positive(grossIncome - nonTaxableIncome);
  const months = Math.min(12, Math.max(0, Math.floor(data.months)));
  const exemptIncome = Math.min(netIncome, uvtToPesos(year.pensions.exemptMonthlyUvt * months, year));
  return {
    grossIncome,
    nonTaxableIncome,
    netIncome,
    exemptIncome,
    taxableIncome: positive(netIncome - exemptIncome),
  };
};

// ---------------------------------------------------------------------------------------------
// Cédula de dividendos y participaciones (boxes 104–110, 118–120, 124)
// ---------------------------------------------------------------------------------------------

/**
 * Kind of dividend, as the paying company certifies it:
 * - `until-2016-non-taxed`: profits of 2016 and earlier, non-taxable (boxes 104 and 105).
 * - `until-2016-taxed`: profits of 2016 and earlier, taxed (box 104, art. 241 until 2016 in 119).
 * - `first-subcedule`: 2017 and later, art. 49 num. 3 (box 107, joins the art. 241 base).
 * - `second-subcedule`: 2017 and later, art. 49 par. 2 (box 108, 35 % in 118 first).
 * - `foreign`: received from abroad (box 109, 35 % in 120).
 */
export type DividendKind =
  'until-2016-non-taxed' | 'until-2016-taxed' | 'first-subcedule' | 'second-subcedule' | 'foreign';

export type DividendConcept = {
  id: string;
  label: string;
  entity: string;
  kind: DividendKind;
  amount: number;
  origin: Origin;
  exogenousAmount?: number;
};

export type DividendResult = {
  /** Box 104. */
  until2016: number;
  /** Box 105. */
  until2016NonTaxed: number;
  /** Box 106 = 104 − 105. */
  until2016Net: number;
  /** Box 107. */
  firstSubcedule: number;
  /** Box 108. */
  secondSubcedule: number;
  /** Box 109. */
  foreign: number;
  /** Box 110: exempt part of 109 (Andean Community, Decisión 578). */
  foreignExempt: number;
  /** Box 118 = 108 × 35 %. */
  secondSubceduleTax: number;
  /** Box 119: art. 241 table in force until 2016 over 106. */
  until2016Tax: number;
  /** Box 120 = (109 − 110) × 35 %. */
  foreignTax: number;
  /** Part of box 111 that comes from dividends: 107 + 108 − 118. */
  baseForTable: number;
  /** Box 124: 19 % of (107 + 108 − 118) above 1.090 UVT. */
  discount: number;
};

const amountOf = (concepts: readonly DividendConcept[], ...kinds: DividendKind[]) =>
  sum(concepts.filter(concept => kinds.includes(concept.kind)).map(concept => concept.amount));

export const computeDividends = (
  concepts: readonly DividendConcept[],
  year: TaxYearConfig,
  /** Dividends from Andean Community countries included in the foreign ones (Decisión 578). */
  andeanExempt = 0,
): DividendResult => {
  const rates = year.dividends;
  const until2016 = amountOf(concepts, 'until-2016-non-taxed', 'until-2016-taxed');
  const until2016NonTaxed = amountOf(concepts, 'until-2016-non-taxed');
  const until2016Net = positive(until2016 - until2016NonTaxed);
  const firstSubcedule = amountOf(concepts, 'first-subcedule');
  const secondSubcedule = amountOf(concepts, 'second-subcedule');
  const foreign = amountOf(concepts, 'foreign');
  const foreignExempt = Math.min(positive(andeanExempt), foreign);

  const secondSubceduleTax = roundToThousand(secondSubcedule * rates.secondSubceduleRate);
  const until2016Tax = computeTableTax(until2016Net, year, year.until2016Brackets).tax;
  const foreignTax = roundToThousand(positive(foreign - foreignExempt) * rates.foreignRate);
  const baseForTable = positive(firstSubcedule + secondSubcedule - secondSubceduleTax);
  const discountUvt = positive(pesosToUvt(baseForTable, year) - rates.discountFromUvt) * rates.discountRate;

  return {
    until2016,
    until2016NonTaxed,
    until2016Net,
    firstSubcedule,
    secondSubcedule,
    foreign,
    foreignExempt,
    secondSubceduleTax,
    until2016Tax,
    foreignTax,
    baseForTable,
    discount: roundToThousand(discountUvt * year.uvt),
  };
};

// ---------------------------------------------------------------------------------------------
// Ganancias ocasionales (boxes 112–115, 127)
// ---------------------------------------------------------------------------------------------

/**
 * Kind of occasional gain and its non-taxable or exempt part (box 114, arts. 303-1 and 307 E.T.):
 * - `lottery`: lotteries, raffles and bets. No exemption; 20 % rate.
 * - `asset-sale`: sale of an asset held two years or more. No exemption.
 * - `home-sale`: sale of the home; first 5.000 UVT of the gain exempt if the money went to an AFC
 *   account or to the mortgage of that home (art. 311-1 E.T.).
 * - `inherited-home`: the deceased's home; first 13.000 UVT exempt.
 * - `inherited-real-estate`: other real estate of the deceased; first 6.500 UVT exempt.
 * - `inheritance`: other inheritances or legacies to a spouse or heir; first 3.250 UVT exempt.
 * - `gift`: gifts, and inheritances to people who are not heirs by law; 20 % exempt, up to
 *   1.625 UVT.
 * - `life-insurance`: life insurance payouts; first 3.250 UVT exempt.
 * - `personal-effects`: books, clothes and household goods of the deceased; fully exempt.
 * - `other`: liquidation of companies held two years or more and other gains. No exemption.
 */
export type OccasionalGainKind =
  | 'lottery'
  | 'asset-sale'
  | 'home-sale'
  | 'inherited-home'
  | 'inherited-real-estate'
  | 'inheritance'
  | 'gift'
  | 'life-insurance'
  | 'personal-effects'
  | 'other';

/** Exempt amount per kind, in UVT of the year (null = fully exempt). */
const exemptUvt = (year: TaxYearConfig): Partial<Record<OccasionalGainKind, number | null>> => ({
  'home-sale': year.occasionalGains.homeSaleExemptUvt,
  'inherited-home': year.occasionalGains.inheritedHomeExemptUvt,
  'inherited-real-estate': year.occasionalGains.inheritedRealEstateExemptUvt,
  inheritance: year.occasionalGains.inheritanceExemptUvt,
  'life-insurance': year.occasionalGains.lifeInsuranceExemptUvt,
  'personal-effects': null,
});

export type OccasionalGainConcept = {
  id: string;
  label: string;
  entity: string;
  kind: OccasionalGainKind;
  /** Box 112: sale price, value received or prize before withholding. */
  amount: number;
  /** Box 113: fiscal cost of the asset sold (only sales). */
  cost: number;
  /** Home sales: the money went to an AFC account or to the mortgage of that home. */
  toAfcOrMortgage?: boolean;
  origin: Origin;
  exogenousAmount?: number;
};

export type OccasionalGainsResult = {
  /** Box 112. */
  grossIncome: number;
  /** Box 113. */
  costs: number;
  /** Box 114: never above 112 − 113. */
  exempt: number;
  /** Box 115 = 112 − 113 − 114. */
  taxable: number;
  /** Part of 115 from lotteries, raffles and bets (20 %). */
  taxableLottery: number;
  /** Box 127: 20 % of lotteries + 15 % of the rest. */
  tax: number;
};

/** Exempt part of one gain, by its kind. */
export const occasionalGainExempt = (concept: OccasionalGainConcept, year: TaxYearConfig): number => {
  const gain = positive(concept.amount - concept.cost);
  if (concept.kind === 'gift') {
    const { giftExemptRate, giftExemptCapUvt } = year.occasionalGains;
    return Math.min(Math.round(gain * giftExemptRate), uvtToPesos(giftExemptCapUvt, year));
  }
  if (concept.kind === 'home-sale' && !concept.toAfcOrMortgage) return 0;
  const capUvt = exemptUvt(year)[concept.kind];
  if (capUvt === undefined) return 0;
  if (capUvt === null) return gain;
  return Math.min(gain, uvtToPesos(capUvt, year));
};

/**
 * Exempt caps apply per kind over the sum of its gains (e.g. 3.250 UVT for all the inheritances
 * of the same person), so gains of the same kind are added before applying the cap.
 */
export const computeOccasionalGains = (
  concepts: readonly OccasionalGainConcept[],
  year: TaxYearConfig,
): OccasionalGainsResult => {
  const grossIncome = sum(concepts.map(concept => concept.amount));
  const costs = sum(concepts.map(concept => Math.min(positive(concept.cost), concept.amount)));

  const kinds = [...new Set(concepts.map(concept => concept.kind))];
  let exempt = 0;
  let taxableLottery = 0;
  for (const kind of kinds) {
    const ofKind = concepts.filter(concept => concept.kind === kind);
    const merged: OccasionalGainConcept = {
      id: kind,
      label: kind,
      entity: '',
      kind,
      amount: sum(ofKind.map(concept => concept.amount)),
      cost: sum(ofKind.map(concept => Math.min(positive(concept.cost), concept.amount))),
      // Home sales only count as exempt for the sales whose money went to AFC or the mortgage.
      origin: 'user',
    };
    if (kind === 'home-sale') {
      exempt += occasionalGainExempt(
        {
          ...merged,
          amount: sum(ofKind.filter(c => c.toAfcOrMortgage).map(c => c.amount)),
          cost: sum(ofKind.filter(c => c.toAfcOrMortgage).map(c => Math.min(positive(c.cost), c.amount))),
          toAfcOrMortgage: true,
        },
        year,
      );
    } else {
      exempt += occasionalGainExempt(merged, year);
    }
    if (kind === 'lottery') taxableLottery = positive(merged.amount - merged.cost);
  }

  exempt = Math.min(exempt, positive(grossIncome - costs));
  const taxable = positive(grossIncome - costs - exempt);
  const lotteryPart = Math.min(taxableLottery, taxable);
  const { lotteryRate, rate } = year.occasionalGains;
  const tax = roundToThousand(lotteryPart * lotteryRate + (taxable - lotteryPart) * rate);

  return { grossIncome, costs, exempt, taxable, taxableLottery: lotteryPart, tax };
};
