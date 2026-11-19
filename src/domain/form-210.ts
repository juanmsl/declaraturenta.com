import type { DeclarationData, DeclarationResult } from './declaration';
import { EDITABLE_BOXES, getBoxConcepts, isCountBox } from './box-concepts';
import { ADDITIONAL_DEPENDENT_UVT } from './declaration';
import { OFFICIAL_BOX_TITLES } from './form-210-titles';

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
const NOT_APPLICABLE: BoxSpec = { kind: 'not-applicable' };

/** Kind and formula of every box, as in Figma screen 09. Matrix labels come from SCHEDULE_ROWS. */
const BOX_SPECS: Record<number, BoxSpec> = {
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
    formula: '= 55,43 % de los rendimientos financieros + aportes como independiente',
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
  47: { kind: 'not-applicable', note: 'Sin renta líquida' },
  63: { kind: 'not-applicable', note: 'Sin renta líquida' },
  80: NOT_APPLICABLE,
  36: ENTERED,
  48: NOT_APPLICABLE,
  64: NOT_APPLICABLE,
  81: NOT_APPLICABLE,
  37: { kind: 'calculated', formula: '= 35 + 36' },
  49: { kind: 'calculated', formula: '= 47 + 48' },
  65: { kind: 'calculated', formula: '= 63 + 64' },
  82: { kind: 'calculated', formula: '= 80 + 81' },
  38: ENTERED,
  50: NOT_APPLICABLE,
  66: NOT_APPLICABLE,
  83: NOT_APPLICABLE,
  39: ENTERED,
  51: NOT_APPLICABLE,
  67: NOT_APPLICABLE,
  84: NOT_APPLICABLE,
  40: { kind: 'calculated', formula: '= 38 + 39' },
  52: { kind: 'calculated', formula: '= 50 + 51' },
  68: { kind: 'calculated', formula: '= 66 + 67' },
  85: { kind: 'calculated', formula: '= 83 + 84' },
  41: {
    kind: 'calculated',
    formula: '= 37 + 40, tope del 40 % de los ingresos menos 33, 44, 59 y 76, hasta 1.340 UVT',
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
  89: NOT_APPLICABLE,
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
  98: { label: 'Renta presuntiva', kind: 'entered' },
  99: { label: 'Ingresos brutos por pensiones', kind: 'entered' },
  100: { label: 'Ingresos no constitutivos de renta', kind: 'entered' },
  101: { label: 'Renta líquida', kind: 'calculated', formula: '= 99 − 100' },
  102: {
    label: 'Rentas exentas de pensiones',
    kind: 'calculated',
    formula: 'Hasta 1.000 UVT por cada mes de pensión (art. 206 num. 5 E.T.)',
  },
  103: { label: 'Renta líquida gravable de pensiones', kind: 'calculated', formula: '= 101 − 102' },
  104: { label: 'Dividendos 2016 y anteriores, y otros', kind: 'entered' },
  105: { label: 'Ingresos no constitutivos de renta', kind: 'entered' },
  106: { label: 'Renta líquida ordinaria 2016 y anteriores', kind: 'calculated', formula: '= 104 − 105' },
  107: { label: 'Dividendos 2017 y siguientes, 1.ª subcédula', kind: 'entered' },
  108: { label: 'Dividendos 2017 y siguientes, 2.ª subcédula', kind: 'entered' },
  109: { label: 'Dividendos recibidos del exterior', kind: 'entered' },
  110: { label: 'Rentas exentas de la casilla 109', kind: 'entered' },
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
    label: 'Renta presuntiva, pensiones y dividendos',
    kind: 'calculated',
    formula: 'Tabla art. 241 sobre 111, si 98 es mayor que 97',
  },
  118: { label: 'Dividendos 2017 y siguientes, 2.ª subcédula', kind: 'calculated', formula: '= 108 × 35 %' },
  119: {
    label: 'Dividendos año 2016',
    kind: 'calculated',
    formula: 'Tabla art. 241 vigente hasta 2016 sobre 106',
  },
  120: { label: 'Dividendos recibidos del exterior', kind: 'calculated', formula: '= (109 − 110) × 35 %' },
  121: {
    label: 'Total impuesto sobre las rentas líquidas gravables',
    kind: 'calculated',
    formula: '= 116 + 117 + 118 + 119 + 120',
  },
  122: { label: 'Impuestos pagados en el exterior', kind: 'entered' },
  123: { label: 'Donaciones', kind: 'entered' },
  124: {
    label: 'Dividendos, participaciones y otros',
    kind: 'calculated',
    formula: '19 % de (107 + 108 − 118) por encima de 1.090 UVT',
  },
  125: { label: 'Total descuentos tributarios', kind: 'calculated', formula: '= 122 + 123 + 124' },
  126: { label: 'Impuesto neto de renta', kind: 'calculated', formula: '= 121 − 125' },
  127: {
    label: 'Impuesto de ganancias ocasionales',
    kind: 'calculated',
    formula: '15 % de 115; 20 % para loterías, rifas y apuestas',
  },
  128: { label: 'Descuento por impuestos pagados en el exterior por ganancias ocasionales', kind: 'entered' },
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
  135: { label: 'Sanciones', kind: 'entered' },
  136: { label: 'Total saldo a pagar', kind: 'calculated', formula: '= 129 + 133 + 135 − 130 − 131 − 132' },
  137: { label: 'Total saldo a favor', kind: 'highlighted', formula: '= 130 + 131 + 132 − 129 − 133 − 135' },
  138: { label: 'Número de dependientes económicos', kind: 'entered' },
  139: {
    label: 'Adición por dependientes a la casilla 92',
    kind: 'calculated',
    formula: `= 138 × ${ADDITIONAL_DEPENDENT_UVT} UVT, hasta 4 y sin pasar de 42 + 57`,
  },
  140: {
    label: 'Superó el tope indicativo de costos (art. 336-1 E.T.)',
    kind: 'not-applicable',
    note: 'Solo si 45 ÷ 43 supera el 60 %',
  },
  141: { label: 'Aporte voluntario', kind: 'entered', note: 'Opcional' },
};

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
  return {
    28: result.electronicInvoiceDeduction,
    29: result.grossAssets,
    30: result.totalDebts,
    31: result.netAssets,
    32: result.grossLaborIncome,
    33: labor.nonTaxableIncome,
    34: labor.netIncome,
    35: labor.voluntaryContributions,
    36: labor.exempt25,
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
    53: limitedBenefits.fees,
    54: fees.netIncome - limitedBenefits.fees,
    55: fees.loss,
    57: fees.netIncome - limitedBenefits.fees,
    58: result.capital.grossIncome,
    59: result.capital.nonTaxableIncome,
    60: result.capital.costs,
    61: result.capital.netIncome,
    69: limitedBenefits.capital,
    70: result.capital.netIncome - limitedBenefits.capital,
    73: result.capital.netIncome - limitedBenefits.capital,
    74: result.nonLabor.grossIncome,
    75: result.nonLabor.returns,
    76: result.nonLabor.nonTaxableIncome,
    77: result.nonLabor.costs,
    78: result.nonLabor.netIncome,
    86: limitedBenefits.nonLabor,
    87: result.nonLabor.netIncome - limitedBenefits.nonLabor,
    90: result.nonLabor.netIncome - limitedBenefits.nonLabor,
    91: result.generalNetIncome,
    92: result.totalBenefits,
    93: result.taxableIncome,
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
    124: result.dividends.discount,
    125: result.taxDiscounts,
    126: result.netIncomeTax,
    127: result.occasionalGainsTax,
    129: result.taxDue,
    130: data.previousYearAdvance,
    131: data.previousBalanceInFavor,
    132: result.withholdings,
    133: result.advance.amount,
    134: result.amountToPay,
    136: result.amountToPay,
    137: result.amountInFavor,
    138: data.deductions.dependents,
    139: result.dependentsAddition,
  };
};

/** "N conceptos" under each editable box: how many concepts add up to it right now. */
const boxNotes = (data: DeclarationData, result: DeclarationResult): Partial<Record<number, string>> => {
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
  if (result.capital.inflationComponent > 0) notes[59] = 'Componente inflacionario 55,43 %';
  if (result.fees.exceedsIndicativeCap) notes[140] = 'Marca X: tus costos superan el 60 % de 43';
  return notes;
};

export type Form210 = Map<number, Form210Box>;

/** Builds every box of the 210 from the user's data and the computed return. */
export const buildForm210 = (data: DeclarationData, result: DeclarationResult): Form210 => {
  const values = boxValues(data, result);
  const notes = boxNotes(data, result);
  const form: Form210 = new Map();

  // The final result is highlighted: balance in favor (137) or amount to pay (136).
  const resultBox = result.amountToPay > 0 ? 136 : 137;

  for (const [key, spec] of Object.entries(BOX_SPECS)) {
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
