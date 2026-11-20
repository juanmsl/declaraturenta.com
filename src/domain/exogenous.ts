import type { Asset, AssetKind, DeclarationData, Debt, IncomeConcept, LaborConcept } from './declaration';
import type { ExogenousFile, ExogenousLine } from './exogenous-file';
import type { DividendKind } from './other-schedules';
import type { TaxYearConfig } from './tax-years';

/**
 * Exogenous information (información exógena): what third parties reported to the DIAN about
 * the taxpayer, classified by where it goes in the return. ADR 0024.
 */
export type ExogenousItemKind =
  /** Box 32: labor payments. */
  | 'labor-income'
  /** Box 33: mandatory health, pension and solidarity contributions withheld by the employer. */
  | 'labor-non-taxable'
  /** Boxes 44, 59 or 76: mandatory pension paid as an independent contributor. */
  | 'other-non-taxable'
  /** Box 35: voluntary pension and AFC contributions. */
  | 'voluntary-pension'
  /** Box 132. */
  | 'withholding'
  /** Box 58: financial yields and interest. */
  | 'capital-income'
  /** Box 74: other income. */
  | 'non-labor-income'
  /** Box 43 (or 32 with the 25 % exempt): fees and services as an independent. */
  | 'fees-income'
  /** Box 99: pensions. */
  | 'pension-income'
  /** Boxes 104–109: dividends; `dividendKind` says which. */
  | 'dividend'
  /** Box 112: occasional gains. */
  | 'occasional-gain'
  /** Box 29. */
  | 'asset'
  /** Box 30. */
  | 'debt'
  /** Box 38. */
  | 'housing-interest'
  /** Box 39 (prepaid health). */
  | 'prepaid-health'
  /** Box 131. */
  | 'previous-balance'
  /** Box 28: purchases backed by electronic invoices that can give the 1 % deduction. */
  | 'electronic-invoice'
  /** Only used by the filing tests or not part of the return (movements, card spending…). */
  | 'informative';

/** Why an item must be checked by the user before it is used. */
export type ExogenousReview = 'duplicate' | 'vehicle' | 'housing' | 'dividend' | 'occasional-gain';

export type ExogenousItem = {
  id: string;
  kind: ExogenousItemKind;
  label: string;
  entity: string;
  amount: number;
  assetKind?: AssetKind;
  dividendKind?: DividendKind;
  review?: ExogenousReview;
};

export type ExogenousReport = {
  fileName: string | null;
  year: number | null;
  holderName: string;
  /** Last two digits of the holder's document; the rest is never stored. */
  documentLastDigits: string;
  thresholds: ExogenousFile['thresholds'];
  items: ExogenousItem[];
};

const SPECIAL_WORDS = new Set([
  's.a.',
  's.a.s.',
  's.a.s',
  's.a',
  'sas',
  'ltda',
  'u.a.e.',
  'dian',
  'afc',
  'cdt',
]);

/** "BANCO CORDILLERA S.A." → "Banco Cordillera S.A." */
export const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(' ')
    .map(word =>
      SPECIAL_WORDS.has(word) || word.includes('.')
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ')
    .replace(/\bDe\b|\bY\b|\bDel\b|\bLa\b|\bLos\b/gu, word => word.toLowerCase());

/** Removes the DIAN codes in parentheses: "Pagos por salarios (Concepto: 2276)" → "Pagos por salarios". */
const cleanDetail = (detail: string): string =>
  detail
    .replace(/\s*\((concepto|titular|informado)[^)]*\)/giu, '')
    .replace(/\s+/gu, ' ')
    .trim();

const lastDigits = (extra: string, count = 4): string => {
  const match = /número de cuenta \/ documento:\s*(\d+)/iu.exec(extra);
  return match?.[1] ? match[1].slice(-count) : '';
};

/** "Concepto Códigos Tributaria: *1* Cuenta de ahorro" → "Cuenta de ahorro". */
const extraType = (extra: string): string => {
  const match = /\*\d+\*\s*([^|]+)/u.exec(extra);
  return match?.[1]?.trim() ?? '';
};

const withDigits = (label: string, digits: string) => (digits ? `${label} ····${digits}` : label);

const has = (value: string, ...parts: string[]) =>
  parts.some(part => value.toLowerCase().includes(part.toLowerCase()));

/** Decides where a reported value goes, mostly by the box the DIAN suggests ("Uso declaración"). */
export const classifyLine = (
  line: ExogenousLine,
): Pick<ExogenousItem, 'kind' | 'label' | 'assetKind' | 'dividendKind' | 'review'> => {
  const { detail, suggestedUse: use, extra } = line;
  const label = cleanDetail(detail);

  if (has(detail, 'susceptible de beneficio'))
    return { kind: 'electronic-invoice', label: 'Compras con factura electrónica' };
  if (/\bR131\b/u.test(use)) return { kind: 'previous-balance', label: 'Saldo a favor del año anterior' };
  if (/\bR132\b/u.test(use)) return { kind: 'withholding', label: 'Retención en la fuente' };
  if (/\bR32\b/u.test(use)) return { kind: 'labor-income', label };
  if (use.toLowerCase().startsWith('ingresos no constitutivos')) {
    return has(extra, 'independiente') || /\bR44\b/u.test(use)
      ? { kind: 'other-non-taxable', label }
      : { kind: 'labor-non-taxable', label };
  }
  if (/\bR35\b/u.test(use) && has(detail, 'voluntari', 'afc')) return { kind: 'voluntary-pension', label };
  if (/\bR43\b/u.test(use)) return { kind: 'fees-income', label };
  if (/\bR99\b/u.test(use)) return { kind: 'pension-income', label };
  // The DIAN suggests the subcédula; 2016-and-earlier dividends need the company's certificate.
  if (/\bR104\b/u.test(use))
    return { kind: 'dividend', label, dividendKind: 'until-2016-taxed', review: 'dividend' };
  if (/\bR107\b/u.test(use)) return { kind: 'dividend', label, dividendKind: 'first-subcedule' };
  if (/\bR108\b/u.test(use)) return { kind: 'dividend', label, dividendKind: 'second-subcedule' };
  if (/\bR109\b/u.test(use)) return { kind: 'dividend', label, dividendKind: 'foreign' };
  if (/\bR112\b/u.test(use)) return { kind: 'occasional-gain', label, review: 'occasional-gain' };
  if (/\bR58\b/u.test(use)) return { kind: 'capital-income', label };
  if (/\bR74\b/u.test(use)) return { kind: 'non-labor-income', label };
  if (has(detail, 'intereses') && has(detail, 'vivienda'))
    return { kind: 'housing-interest', label, review: 'housing' };
  if (has(detail, 'medicina prepagada')) return { kind: 'prepaid-health', label };
  if (has(detail, 'vehículo', 'vehiculo')) {
    const plate = /placa:\s*(\w+)/iu.exec(extra)?.[1];
    return {
      kind: 'asset',
      assetKind: 'vehicle',
      label: plate ? `Vehículo placa ${plate}` : 'Vehículo',
      review: 'vehicle',
    };
  }
  if (/\bR30\b/u.test(use) && line.amount < 0) return { kind: 'debt', label };
  if (/\bR29\b/u.test(use) || (has(use, 'tope 2') && has(detail, 'saldo'))) {
    if (has(detail, 'cuentas bancarias')) {
      return {
        kind: 'asset',
        assetKind: 'bank-account',
        label: withDigits(extraType(extra) || 'Cuenta bancaria', lastDigits(extra)),
      };
    }
    if (has(detail, 'cdt'))
      return { kind: 'asset', assetKind: 'investment', label: withDigits('CDT', lastDigits(extra)) };
    if (has(detail, 'fondos de inversión', 'fondos de inversion')) {
      return {
        kind: 'asset',
        assetKind: 'investment',
        label: withDigits('Fondo de inversión colectiva', lastDigits(extra)),
      };
    }
    if (has(detail, 'ahorro voluntario')) {
      return {
        kind: 'asset',
        assetKind: 'investment',
        label: has(extra, 'afc') ? 'Cuenta AFC' : 'Ahorro en pensión voluntaria',
      };
    }
    return { kind: 'asset', assetKind: 'other', label };
  }
  return { kind: 'informative', label };
};

const sumOf = (items: readonly ExogenousItem[], kind: ExogenousItemKind) =>
  items.filter(item => item.kind === kind).reduce((total, item) => total + item.amount, 0);

/** Total the report gives for one kind of value. */
export const reportedTotal = (report: ExogenousReport, kind: ExogenousItemKind): number =>
  sumOf(report.items, kind);

/**
 * Builds the report from the file. Voluntary contributions reported both by the employer and by
 * the fund (same amount) are kept once and marked for review.
 */
export const buildExogenousReport = (file: ExogenousFile, fileName: string): ExogenousReport => {
  const items: ExogenousItem[] = [];
  for (const line of file.lines) {
    const classified = classifyLine(line);
    const item: ExogenousItem = {
      id: line.id,
      entity: toTitleCase(line.reporterName),
      amount: Math.abs(line.amount),
      ...classified,
    };
    if (item.kind === 'voluntary-pension') {
      const twin = items.find(
        other =>
          other.kind === 'voluntary-pension' && other.amount === item.amount && other.entity !== item.entity,
      );
      if (twin) {
        twin.review = 'duplicate';
        twin.entity = `${twin.entity} y ${item.entity}`;
        continue;
      }
    }
    items.push(item);
  }
  const digits = file.holder.documentNumber.slice(-2);
  return {
    fileName,
    year: file.year,
    holderName: file.holder.name,
    documentLastDigits: digits,
    thresholds: file.thresholds,
    items,
  };
};

/** Keeps concepts the user changed and takes the rest from the report. */
const mergeConcepts = (current: LaborConcept[], reported: LaborConcept[]): LaborConcept[] =>
  reported.map(concept => {
    const edited = current.find(item => item.id === concept.id && item.origin === 'user');
    return edited ? { ...edited, exogenousAmount: concept.amount } : concept;
  });

const conceptsOf = (
  items: readonly ExogenousItem[],
  kind: ExogenousItemKind,
  financial = false,
): IncomeConcept[] =>
  items
    .filter(item => item.kind === kind)
    .map(item => ({
      id: item.id,
      label: item.label,
      entity: item.entity,
      amount: item.amount,
      origin: 'exogenous' as const,
      ...(financial ? { financial: true } : {}),
    }));

/** Prefills the return with the report. Values the user entered or changed are kept. */
export const applyExogenous = (
  data: DeclarationData,
  report: ExogenousReport,
  year: TaxYearConfig,
): DeclarationData => {
  const { items } = report;
  const concepts = mergeConcepts(
    data.labor.concepts,
    items
      .filter(item => item.kind === 'labor-income')
      .map(item => ({
        id: item.id,
        label: item.label,
        entity: item.entity,
        amount: item.amount,
        origin: 'exogenous' as const,
      })),
  );
  const assets: Asset[] = items
    .filter(item => item.kind === 'asset')
    .map(item => ({
      id: item.id,
      kind: item.assetKind ?? 'other',
      label: item.label,
      detail: item.entity,
      amount: item.amount,
      origin: 'exogenous',
      ...(item.review ? { needsReview: true } : {}),
    }));
  const debts: Debt[] = items
    .filter(item => item.kind === 'debt')
    .map(item => ({
      id: item.id,
      label: item.label,
      detail: `${item.entity} · saldo al 31 de diciembre`,
      amount: item.amount,
      origin: 'exogenous',
    }));

  // Independent pension contributions go to the schedule with income, as the DIAN suggests
  // (44 / 59 / 76): fees first, then capital, else non-labor.
  const independentContributions = sumOf(items, 'other-non-taxable');
  const feesConcepts = mergeConcepts(data.fees.concepts, conceptsOf(items, 'fees-income'));
  const capitalConcepts = mergeConcepts(data.capital.concepts, conceptsOf(items, 'capital-income', true));
  const nonLaborConcepts = mergeConcepts(data.nonLabor.concepts, conceptsOf(items, 'non-labor-income'));
  const toFees = feesConcepts.length > 0;
  const toCapital = !toFees && (capitalConcepts.length > 0 || nonLaborConcepts.length === 0);
  const toNonLabor = !toFees && !toCapital;

  return {
    ...data,
    fees: {
      ...data.fees,
      concepts: feesConcepts,
      nonTaxableIncome: toFees ? independentContributions : data.fees.nonTaxableIncome,
    },
    capital: {
      ...data.capital,
      concepts: capitalConcepts,
      independentContributions: toCapital ? independentContributions : 0,
    },
    nonLabor: {
      ...data.nonLabor,
      concepts: nonLaborConcepts,
      independentContributions: toNonLabor ? independentContributions : 0,
    },
    pensions: {
      ...data.pensions,
      concepts: mergeConcepts(data.pensions.concepts, conceptsOf(items, 'pension-income')),
    },
    dividends: {
      concepts: [
        ...data.dividends.concepts.filter(concept => concept.origin === 'user'),
        ...items
          .filter(item => item.kind === 'dividend')
          .map(item => ({
            id: item.id,
            label: item.label,
            entity: item.entity,
            kind: item.dividendKind ?? 'first-subcedule',
            amount: item.amount,
            origin: 'exogenous' as const,
          })),
      ],
    },
    occasionalGains: {
      concepts: [
        ...data.occasionalGains.concepts.filter(concept => concept.origin === 'user'),
        ...items
          .filter(item => item.kind === 'occasional-gain')
          .map(item => ({
            id: item.id,
            label: item.label,
            entity: item.entity,
            kind: 'other' as const,
            amount: item.amount,
            cost: 0,
            origin: 'exogenous' as const,
          })),
      ],
    },
    general: {
      ...data.general,
      electronicInvoicePurchases: Math.round(
        sumOf(items, 'electronic-invoice') * year.general.electronicInvoiceRate,
      ),
    },
    obligation: {
      creditCardPurchases: report.thresholds.cardSpending,
      totalPurchases: report.thresholds.purchases,
      deposits: report.thresholds.deposits,
    },
    labor: {
      ...data.labor,
      concepts,
      hasIndependentIncome: toFees ? true : data.labor.hasIndependentIncome,
      salaries: concepts.reduce((total, concept) => total + concept.amount, 0),
      nonTaxableIncome: sumOf(items, 'labor-non-taxable'),
      voluntaryContributions: sumOf(items, 'voluntary-pension'),
    },
    assets: [...data.assets.filter(asset => asset.origin === 'user'), ...assets],
    debts: [...data.debts.filter(debt => debt.origin === 'user'), ...debts],
    deductions: {
      ...data.deductions,
      housingInterestPaid: sumOf(items, 'housing-interest'),
      prepaidHealthPaid: sumOf(items, 'prepaid-health'),
    },
    withholdings: sumOf(items, 'withholding'),
    previousBalanceInFavor: sumOf(items, 'previous-balance'),
  };
};

/** Removes every value that would come from the report ("Llenar sin exógena"). */
export const clearExogenous = (data: DeclarationData): DeclarationData => ({
  ...data,
  general: { ...data.general, electronicInvoicePurchases: 0 },
  obligation: { creditCardPurchases: 0, totalPurchases: 0, deposits: 0 },
  labor: { ...data.labor, concepts: [], salaries: 0, nonTaxableIncome: 0, voluntaryContributions: 0 },
  fees: { ...data.fees, concepts: data.fees.concepts.filter(c => c.origin === 'user'), nonTaxableIncome: 0 },
  pensions: { ...data.pensions, concepts: data.pensions.concepts.filter(c => c.origin === 'user') },
  dividends: { concepts: data.dividends.concepts.filter(c => c.origin === 'user') },
  occasionalGains: { concepts: data.occasionalGains.concepts.filter(c => c.origin === 'user') },
  capital: {
    ...data.capital,
    concepts: data.capital.concepts.filter(c => c.origin === 'user'),
    independentContributions: 0,
  },
  nonLabor: {
    ...data.nonLabor,
    concepts: data.nonLabor.concepts.filter(c => c.origin === 'user'),
    independentContributions: 0,
  },
  assets: data.assets.filter(asset => asset.origin === 'user'),
  debts: data.debts.filter(debt => debt.origin === 'user'),
  deductions: { ...data.deductions, housingInterestPaid: 0, prepaidHealthPaid: 0 },
  withholdings: 0,
  previousBalanceInFavor: 0,
});

/** Distinct entities that reported values used in the return. */
export const countReportingEntities = (report: ExogenousReport): number =>
  new Set(report.items.filter(item => item.kind !== 'informative').map(item => item.entity)).size;
