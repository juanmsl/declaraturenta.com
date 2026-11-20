import type { DeclarationData, DeclarationResult } from './declaration';
import { EDITABLE_BOXES, getBoxConcepts, isCountBox } from './box-concepts';
import { OFFICIAL_BOX_TITLES } from './form-210-titles';
import type { TaxYearConfig } from './tax-years';

/**
 * Formulario 210 (taxable year 2025). Short labels and kinds follow the Figma screen 09; official
 * titles and formulas of boxes 28–141 are checked against the official DIAN instructions (ADR 0030).
 */
export const LAST_VERIFIED_BOX = 141;

/**
 * - `entered`: filled by the user or the exogenous report; opens its concepts.
 * - `calculated`: shows its formula. - `not-applicable`: disabled by a rule.
 * - `highlighted`: the final result.
 */
export type BoxKind = 'entered' | 'calculated' | 'not-applicable' | 'highlighted';

export type Form210Box = {
  number: number;
  /** Short label for the screen. */
  label: string;
  /** Title exactly as printed in the DIAN form, to find the box in the portal. */
  officialTitle: string;
  value: number;
  kind: BoxKind;
  /** Formula with box numbers (calculated boxes), e.g. `= 32 − 33`. */
  formula?: string;
  /** Short note under the box, e.g. "6 conceptos". */
  note?: string;
  verified: boolean;
};

export const SCHEDULE_COLUMNS = [
  'Rentas de trabajo',
  'Honorarios y servicios',
  'Rentas de capital',
  'Rentas no laborales',
] as const;

type ScheduleRow = { label: string; boxes: readonly (number | null)[]; group?: string };

/** General schedule matrix: rows × the four income columns (null = no box). */
export const SCHEDULE_ROWS: readonly ScheduleRow[] = [
  { label: 'Ingresos brutos', boxes: [32, 43, 58, 74] },
  { label: 'Devoluciones, rebajas y descuentos', boxes: [null, null, null, 75] },
  { label: 'Ingresos no constitutivos de renta', boxes: [33, 44, 59, 76] },
  { label: 'Costos y deducciones procedentes', boxes: [null, 45, 60, 77] },
  { label: 'Renta líquida', boxes: [34, 46, 61, 78] },
  { label: 'Rentas líquidas pasivas ECE', boxes: [null, null, 62, 79] },
  { label: 'Aportes voluntarios AFC, FVP y AVC', boxes: [35, 47, 63, 80], group: 'Rentas exentas' },
  { label: 'Otras rentas exentas', boxes: [36, 48, 64, 81], group: 'Rentas exentas' },
  { label: 'Total rentas exentas', boxes: [37, 49, 65, 82], group: 'Rentas exentas' },
  { label: 'Intereses de vivienda', boxes: [38, 50, 66, 83], group: 'Deducciones imputables' },
  { label: 'Otras deducciones imputables', boxes: [39, 51, 67, 84], group: 'Deducciones imputables' },
  { label: 'Total deducciones imputables', boxes: [40, 52, 68, 85], group: 'Deducciones imputables' },
  {
    label: 'Rentas exentas y deducciones imputables (limitadas)',
    boxes: [41, 53, 69, 86],
    group: 'Renta líquida ordinaria',
  },
  {
    label: 'Renta líquida ordinaria del ejercicio',
    boxes: [null, 54, 70, 87],
    group: 'Renta líquida ordinaria',
  },
  { label: 'Pérdida líquida del ejercicio', boxes: [null, 55, 71, 88], group: 'Renta líquida ordinaria' },
  { label: 'Compensaciones por pérdidas', boxes: [null, 56, 72, 89], group: 'Renta líquida ordinaria' },
  { label: 'Renta líquida ordinaria', boxes: [42, 57, 73, 90], group: 'Renta líquida ordinaria' },
];

type BoxSpec = { label?: string; kind: BoxKind; formula?: string; note?: string };

const ENTERED: BoxSpec = { kind: 'entered' };

const pct = (rate: number) => `${String(Math.round(rate * 10_000) / 100).replace('.', ',')} %`;
const num = (value: number) => value.toLocaleString('es-CO');

/**
 * Kind and formula of every box, as in Figma screen 09, with the year's rates and caps. Matrix
 * labels come from SCHEDULE_ROWS.
 */
const boxSpecs = (year: TaxYearConfig): Record<number, BoxSpec> => ({
  28: { label: '1 % de compras con factura electrónica', kind: 'entered' },
  29: { label: 'Total patrimonio bruto', kind: 'entered' },
  30: { label: 'Deudas', kind: 'entered' },
  31: { label: 'Total patrimonio líquido', kind: 'calculated', formula: '= 29 − 30' },
  32: ENTERED,
  43: ENTERED,
  58: ENTERED,
  74: ENTERED,
  75: ENTERED,
  33: ENTERED,
  44: ENTERED,
  59: {
    kind: 'calculated',
    formula: `= ${pct(year.general.inflationComponentRate)} de los rendimientos financieros + aportes como independiente`,
  },
  76: ENTERED,
  45: ENTERED,
  60: ENTERED,
  77: ENTERED,
  34: { kind: 'calculated', formula: '= 32 − 33' },
  46: { kind: 'calculated', formula: '= 43 − 44 − 45' },
  61: { kind: 'calculated', formula: '= 58 − 59 − 60' },
  78: { kind: 'calculated', formula: '= 74 − 75 − 76 − 77' },
  62: ENTERED,
  79: ENTERED,
  35: ENTERED,
  47: { kind: 'calculated', formula: 'Aportes voluntarios que no caben en la renta líquida de 34' },
  63: { kind: 'calculated', formula: 'Aportes voluntarios que no caben en 34 ni en 46' },
  80: { kind: 'calculated', formula: 'Aportes voluntarios que no caben en 34, 46 ni 61' },
  36: {
    kind: 'calculated',
    formula: `Cesantías exentas + otras rentas exentas + ${pct(year.labor.exempt25Rate)} (hasta ${num(year.labor.exempt25Uvt)} UVT)`,
  },
  48: { kind: 'calculated', formula: 'Rentas exentas sin tope del 40 % de esta columna' },
  64: { kind: 'calculated', formula: 'Rentas exentas sin tope del 40 % de esta columna' },
  81: { kind: 'calculated', formula: 'Rentas exentas sin tope del 40 % de esta columna' },
  37: { kind: 'calculated', formula: '= 35 + 36' },
  49: { kind: 'calculated', formula: '= 47 + 48' },
  65: { kind: 'calculated', formula: '= 63 + 64' },
  82: { kind: 'calculated', formula: '= 80 + 81' },
  38: ENTERED,
  50: { kind: 'calculated', formula: 'Intereses de vivienda cuando no hay rentas de trabajo' },
  66: { kind: 'calculated', formula: 'Intereses de vivienda cuando no hay rentas de trabajo' },
  83: { kind: 'calculated', formula: 'Intereses de vivienda cuando no hay rentas de trabajo' },
  39: ENTERED,
  51: {
    kind: 'calculated',
    formula: `Aportes a cesantías como independiente (hasta ${num(year.benefits.independentSeveranceUvt)} UVT y 1/12 de 43); GMF e ICETEX sin rentas de trabajo`,
  },
  67: { kind: 'calculated', formula: 'GMF e ICETEX cuando no hay rentas de trabajo' },
  84: { kind: 'calculated', formula: 'GMF e ICETEX cuando no hay rentas de trabajo' },
  40: { kind: 'calculated', formula: '= 38 + 39' },
  52: { kind: 'calculated', formula: '= 50 + 51' },
  68: { kind: 'calculated', formula: '= 66 + 67' },
  85: { kind: 'calculated', formula: '= 83 + 84' },
  41: {
    kind: 'calculated',
    formula: `= 37 + 40, tope del ${pct(year.general.benefitsCapRate)} de los ingresos menos 33, 44, 59 y 76, hasta ${num(year.general.benefitsCapUvt)} UVT`,
  },
  53: { kind: 'calculated', formula: '= 49 + 52, con tope restante' },
  69: { kind: 'calculated', formula: '= 65 + 68, con tope restante' },
  86: { kind: 'calculated', formula: '= 82 + 85, con tope restante' },
  54: { kind: 'calculated', formula: '= 43 − 44 − 45 − 53' },
  70: { kind: 'calculated', formula: '= 58 + 62 − 59 − 60 − 69' },
  87: { kind: 'calculated', formula: '= 74 + 79 − 75 − 76 − 77 − 86' },
  55: { kind: 'calculated', formula: '= 44 + 45 − 43' },
  71: { kind: 'calculated', formula: '= 59 + 60 − 58 − 62' },
  88: { kind: 'calculated', formula: '= 75 + 76 + 77 − 74 − 79' },
  56: ENTERED,
  72: ENTERED,
  89: ENTERED,
  42: { kind: 'calculated', formula: '= 34 − 41' },
  57: { kind: 'calculated', formula: '= 54 − 56' },
  73: { kind: 'calculated', formula: '= 70 − 72' },
  90: { kind: 'calculated', formula: '= 87 − 89' },
  91: { label: 'Renta líquida', kind: 'calculated', formula: '= 41 + 42 + 53 + 57 + 69 + 73 + 86 + 90' },
  92: {
    label: 'Rentas exentas y deducciones imputables',
    kind: 'calculated',
    formula: '= 28 + 41 + 53 + 69 + 86 + 139',
  },
  93: { label: 'Renta líquida ordinaria', kind: 'calculated', formula: '= 91 − 92' },
  94: { label: 'Compensaciones por pérdidas 2018 y anteriores', kind: 'entered' },
  95: { label: 'Compensaciones por exceso de renta presuntiva', kind: 'entered' },
  96: { label: 'Rentas gravables', kind: 'entered' },
  97: { label: 'Renta líquida gravable', kind: 'calculated', formula: '= 93 + 96 − 94 − 95' },
  98: { label: 'Renta presuntiva', kind: 'calculated', formula: 'Tarifa del 0 % desde 2021 (art. 188 E.T.)' },
  99: { label: 'Ingresos brutos por pensiones', kind: 'entered' },
  100: { label: 'Ingresos no constitutivos de renta', kind: 'entered' },
  101: { label: 'Renta líquida', kind: 'calculated', formula: '= 99 − 100' },
  102: {
    label: 'Rentas exentas de pensiones',
    kind: 'calculated',
    formula: `Hasta ${num(year.pensions.exemptMonthlyUvt)} UVT por cada mes de pensión (art. 206 num. 5 E.T.)`,
  },
  103: { label: 'Renta líquida gravable de pensiones', kind: 'calculated', formula: '= 101 − 102' },
  104: { label: 'Dividendos 2016 y anteriores, y otros', kind: 'entered' },
  105: { label: 'Ingresos no constitutivos de renta', kind: 'entered' },
  106: { label: 'Renta líquida ordinaria 2016 y anteriores', kind: 'calculated', formula: '= 104 − 105' },
  107: { label: 'Dividendos 2017 y siguientes, 1.ª subcédula', kind: 'entered' },
  108: { label: 'Dividendos 2017 y siguientes, 2.ª subcédula', kind: 'entered' },
  109: { label: 'Dividendos recibidos del exterior', kind: 'entered' },
  110: { label: 'Rentas exentas de la casilla 109 (Comunidad Andina)', kind: 'entered' },
  111: {
    label:
      'Renta líquida gravable total (cédula general o renta presuntiva, pensiones y dividendos · art. 241 E.T.)',
    kind: 'calculated',
    formula: '= máx(97, 98) + 103 + 107 + 108 − 118',
  },
  112: { label: 'Ingresos por ganancias ocasionales', kind: 'entered' },
  113: { label: 'Costos por ganancias ocasionales', kind: 'entered' },
  114: { label: 'Ganancias ocasionales no gravadas y exentas', kind: 'entered' },
  115: { label: 'Ganancias ocasionales gravables', kind: 'calculated', formula: '= 112 − 113 − 114' },
  116: {
    label: 'Cédula general, pensiones y dividendos',
    kind: 'calculated',
    formula: 'Tabla art. 241 sobre 111, si 97 es mayor que 98',
  },
  117: {
    note: 'La renta presuntiva es 0 %',
    label: 'Renta presuntiva, pensiones y dividendos',
    kind: 'calculated',
    formula: 'Tabla art. 241 sobre 111, si 98 es mayor que 97',
  },
  118: {
    label: 'Dividendos 2017 y siguientes, 2.ª subcédula',
    kind: 'calculated',
    formula: `= 108 × ${pct(year.dividends.secondSubceduleRate)}`,
  },
  119: {
    label: 'Dividendos año 2016',
    kind: 'calculated',
    formula: 'Tabla art. 241 vigente hasta 2016 sobre 106',
  },
  120: {
    label: 'Dividendos recibidos del exterior',
    kind: 'calculated',
    formula: `= (109 − 110) × ${pct(year.dividends.foreignRate)}`,
  },
  121: {
    label: 'Total impuesto sobre las rentas líquidas gravables',
    kind: 'calculated',
    formula: '= 116 + 117 + 118 + 119 + 120',
  },
  122: {
    label: 'Impuestos pagados en el exterior',
    kind: 'calculated',
    formula: 'Hasta el impuesto colombiano sobre esas mismas rentas (art. 254 E.T.)',
  },
  123: {
    label: 'Donaciones',
    kind: 'calculated',
    formula: `${pct(year.discounts.donationRate)} de lo donado + otros descuentos, hasta el ${pct(year.discounts.capRate)} de 121 (art. 258 E.T.)`,
  },
  124: {
    label: 'Dividendos, participaciones y otros',
    kind: 'calculated',
    formula: `${pct(year.dividends.discountRate)} de (107 + 108 − 118) por encima de ${num(year.dividends.discountFromUvt)} UVT`,
  },
  125: { label: 'Total descuentos tributarios', kind: 'calculated', formula: '= 122 + 123 + 124' },
  126: { label: 'Impuesto neto de renta', kind: 'calculated', formula: '= 121 − 125' },
  127: {
    label: 'Impuesto de ganancias ocasionales',
    kind: 'calculated',
    formula: `${pct(year.occasionalGains.rate)} de 115; ${pct(year.occasionalGains.lotteryRate)} para loterías, rifas y apuestas`,
  },
  128: {
    label: 'Descuento por impuestos pagados en el exterior por ganancias ocasionales',
    kind: 'calculated',
    formula: 'Hasta 127, solo con convenio de doble imposición',
  },
  129: { label: 'Total impuesto a cargo', kind: 'calculated', formula: '= 126 + 127 − 128' },
  130: { label: 'Anticipo de renta liquidado el año anterior', kind: 'entered' },
  131: { label: 'Saldo a favor del año anterior sin solicitud de devolución', kind: 'entered' },
  132: { label: 'Retenciones del año gravable a declarar', kind: 'entered' },
  133: {
    label: 'Anticipo de renta para el año siguiente',
    kind: 'calculated',
    formula: '25 %, 50 % o 75 % de 126 (o del promedio de dos años) − 132',
  },
  134: { label: 'Saldo a pagar por impuesto', kind: 'calculated', formula: '= 129 + 133 − 130 − 131 − 132' },
  135: {
    label: 'Sanciones',
    kind: 'calculated',
    formula: `Extemporaneidad: ${pct(year.penalties.voluntary.taxRate)} de 129 por mes o fracción (art. 641), reducción del art. 640, mínimo ${num(year.penalties.minimumUvt)} UVT`,
  },
  136: { label: 'Total saldo a pagar', kind: 'calculated', formula: '= 129 + 133 + 135 − 130 − 131 − 132' },
  137: { label: 'Total saldo a favor', kind: 'highlighted', formula: '= 130 + 131 + 132 − 129 − 133 − 135' },
  138: { label: 'Número de dependientes económicos', kind: 'entered' },
  139: {
    label: 'Adición por dependientes a la casilla 92',
    kind: 'calculated',
    formula: `= 138 × ${num(year.general.additionalDependentUvt)} UVT, hasta ${String(year.general.maxAdditionalDependents)} y sin pasar de 42 + 57`,
  },
  140: {
    label: 'Superó el tope indicativo de costos (art. 336-1 E.T.)',
    kind: 'not-applicable',
    note: `Solo si 45 ÷ 43 supera el ${pct(year.general.feesIndicativeCostsRate)}`,
  },
  141: { label: 'Aporte voluntario', kind: 'entered', note: 'Opcional' },
});

/** Boxes of the "Otras cédulas" sections (pensions, dividends, occasional gains), collapsed while 0. */
export const OTHER_SCHEDULES = [
  {
    id: 'pensions',
    title: 'Cédula de pensiones',
    fromBox: 99,
    toBox: 103,
    emptyNote: 'No recibiste pensiones',
  },
  {
    id: 'dividends',
    title: 'Cédula de dividendos y participaciones',
    fromBox: 104,
    toBox: 110,
    emptyNote: 'No recibiste dividendos',
  },
  {
    id: 'occasional-gains',
    title: 'Ganancias ocasionales',
    fromBox: 112,
    toBox: 115,
    emptyNote: 'No tuviste herencias, loterías ni venta de activos fijos',
  },
] as const;

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/** Income column of a general-schedule box ("Rentas de trabajo"…), if it sits in the matrix. */
export const scheduleColumnOf = (box: number): string | undefined => {
  for (const row of SCHEDULE_ROWS) {
    const column = row.boxes.indexOf(box);
    if (column >= 0) return SCHEDULE_COLUMNS[column];
  }
  return undefined;
};

const matrixLabel = (box: number): string | undefined => {
  const row = SCHEDULE_ROWS.find(item => item.boxes.includes(box));
  const column = scheduleColumnOf(box);
  return row && column ? `${row.label} por ${column.toLowerCase()}` : undefined;
};

/** Values of every box from the computed return. Boxes the engine does not model are 0. */
const boxValues = (data: DeclarationData, result: DeclarationResult): Record<number, number> => {
  const { labor, fees, limitedBenefits } = result;
  const { columns } = result.benefits;
  return {
    28: result.electronicInvoiceDeduction,
    29: result.grossAssets,
    30: result.totalDebts,
    31: result.netAssets,
    32: result.grossLaborIncome,
    33: labor.nonTaxableIncome,
    34: labor.netIncome,
    35: labor.voluntaryContributions,
    36: columns.labor.otherExempt,
    37: labor.totalExempt,
    38: labor.housingDeduction,
    39: labor.otherDeductions,
    40: labor.totalDeductions,
    41: limitedBenefits.labor,
    42: labor.netIncome - limitedBenefits.labor,
    43: fees.grossIncome,
    44: fees.nonTaxableIncome,
    45: fees.costs,
    46: fees.netIncome,
    47: columns.fees.voluntaryContributions,
    48: columns.fees.otherExempt,
    49: columns.fees.totalExempt,
    50: columns.fees.housing,
    51: columns.fees.otherDeductions,
    52: columns.fees.totalDeductions,
    53: limitedBenefits.fees,
    54: fees.netIncome - limitedBenefits.fees,
    55: fees.loss,
    56: result.compensations.fees,
    57: fees.netIncome - limitedBenefits.fees - result.compensations.fees,
    58: result.capital.grossIncome,
    59: result.capital.nonTaxableIncome,
    60: result.capital.costs,
    61: result.capital.netIncome,
    62: result.ece.capital,
    63: columns.capital.voluntaryContributions,
    64: columns.capital.otherExempt,
    65: columns.capital.totalExempt,
    66: columns.capital.housing,
    67: columns.capital.otherDeductions,
    68: columns.capital.totalDeductions,
    69: limitedBenefits.capital,
    70: result.capital.netIncome + result.ece.capital - limitedBenefits.capital,
    71: Math.max(
      0,
      result.capital.nonTaxableIncome +
        result.capital.costs -
        result.capital.grossIncome -
        result.ece.capital,
    ),
    72: result.compensations.capital,
    73:
      result.capital.netIncome + result.ece.capital - limitedBenefits.capital - result.compensations.capital,
    74: result.nonLabor.grossIncome,
    75: result.nonLabor.returns,
    76: result.nonLabor.nonTaxableIncome,
    77: result.nonLabor.costs,
    78: result.nonLabor.netIncome,
    79: result.ece.nonLabor,
    80: columns.nonLabor.voluntaryContributions,
    81: columns.nonLabor.otherExempt,
    82: columns.nonLabor.totalExempt,
    83: columns.nonLabor.housing,
    84: columns.nonLabor.otherDeductions,
    85: columns.nonLabor.totalDeductions,
    86: limitedBenefits.nonLabor,
    87: result.nonLabor.netIncome + result.ece.nonLabor - limitedBenefits.nonLabor,
    88: Math.max(
      0,
      result.nonLabor.returns +
        result.nonLabor.nonTaxableIncome +
        result.nonLabor.costs -
        result.nonLabor.grossIncome -
        result.ece.nonLabor,
    ),
    89: result.compensations.nonLabor,
    90:
      result.nonLabor.netIncome +
      result.ece.nonLabor -
      limitedBenefits.nonLabor -
      result.compensations.nonLabor,
    91: result.generalNetIncome,
    92: result.totalBenefits,
    93: result.ordinaryIncome,
    94: result.compensations.until2018,
    95: result.compensations.presumptiveExcess,
    96: result.taxableAdditions,
    97: result.taxableIncome,
    99: result.pensions.grossIncome,
    100: result.pensions.nonTaxableIncome,
    101: result.pensions.netIncome,
    102: result.pensions.exemptIncome,
    103: result.pensions.taxableIncome,
    104: result.dividends.until2016,
    105: result.dividends.until2016NonTaxed,
    106: result.dividends.until2016Net,
    107: result.dividends.firstSubcedule,
    108: result.dividends.secondSubcedule,
    109: result.dividends.foreign,
    110: result.dividends.foreignExempt,
    111: result.tableBase,
    112: result.occasionalGains.grossIncome,
    113: result.occasionalGains.costs,
    114: result.occasionalGains.exempt,
    115: result.occasionalGains.taxable,
    116: result.tableTax.tax,
    118: result.dividends.secondSubceduleTax,
    119: result.dividends.until2016Tax,
    120: result.dividends.foreignTax,
    121: result.totalIncomeTax,
    122: result.foreignTaxDiscount,
    123: result.donationsDiscount,
    124: result.dividends.discount,
    125: result.taxDiscounts,
    126: result.netIncomeTax,
    127: result.occasionalGainsTax,
    128: result.occasionalForeignTaxDiscount,
    129: result.taxDue,
    130: data.previousYearAdvance,
    131: data.previousBalanceInFavor,
    132: result.withholdings,
    133: result.advance.amount,
    134: Math.max(0, result.balance - result.lateFiling.penalty),
    135: result.lateFiling.penalty,
    136: result.amountToPay,
    137: result.amountInFavor,
    138: data.deductions.dependents,
    139: result.dependentsAddition,
    141: result.voluntaryContribution,
  };
};

/** "N conceptos" under each editable box: how many concepts add up to it right now. */
const boxNotes = (
  data: DeclarationData,
  result: DeclarationResult,
  year: TaxYearConfig,
): Partial<Record<number, string>> => {
  const notes: Partial<Record<number, string>> = {};
  for (const box of EDITABLE_BOXES) {
    if (isCountBox(box)) continue;
    const count = getBoxConcepts(box, data).length;
    if (count > 0) notes[box] = plural(count, 'concepto');
  }
  const otherDeductions = [result.labor.dependent, result.labor.prepaidHealth].filter(
    value => value > 0,
  ).length;
  if (result.labor.exempt25 > 0) notes[36] = '25 % laboral · 1 concepto';
  if (otherDeductions > 0) notes[39] = plural(otherDeductions, 'concepto');
  if (result.capital.inflationComponent > 0)
    notes[59] = `Componente inflacionario ${pct(year.general.inflationComponentRate)}`;
  if (result.fees.exceedsIndicativeCap)
    notes[140] = `Marca X: tus costos superan el ${pct(year.general.feesIndicativeCostsRate)} de 43`;
  return notes;
};

export type Form210 = Map<number, Form210Box>;

/** Builds every box of the 210 from the user's data and the computed return. */
export const buildForm210 = (
  data: DeclarationData,
  result: DeclarationResult,
  year: TaxYearConfig,
): Form210 => {
  const values = boxValues(data, result);
  const notes = boxNotes(data, result, year);
  const form: Form210 = new Map();

  // The final result is highlighted: balance in favor (137) or amount to pay (136).
  const resultBox = result.amountToPay > 0 ? 136 : 137;

  for (const [key, spec] of Object.entries(boxSpecs(year))) {
    const number = Number(key);
    const isResult = number === 136 || number === 137;
    form.set(number, {
      number,
      label: spec.label ?? matrixLabel(number) ?? `Casilla ${String(number)}`,
      officialTitle: OFFICIAL_BOX_TITLES[number] ?? `Casilla ${String(number)}`,
      value: values[number] ?? 0,
      kind: isResult ? (number === resultBox ? 'highlighted' : 'calculated') : spec.kind,
      formula: spec.formula,
      note: notes[number] ?? spec.note,
      verified: number <= LAST_VERIFIED_BOX,
    });
  }

  return form;
};

/** Boxes whose formula uses `box`, e.g. 32 → [34, 55?]. */
export const findDependentBoxes = (form: Form210, box: number): Form210Box[] =>
  [...form.values()].filter(candidate =>
    candidate.formula
      ? (candidate.formula.match(/\d+(?=[^\d.,%]|$)/gu) ?? []).map(Number).includes(box)
      : false,
  );
