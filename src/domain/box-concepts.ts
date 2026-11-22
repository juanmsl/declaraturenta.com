import type { Asset, DeclarationData, Debt, IncomeConcept, ValueOrigin } from './declaration';
import type { TaxYearConfig } from './tax-years';

/**
 * Concepts behind an entered box of the 210 (Figma screen 09b), and how edits to them are
 * written back to the return. See ADR 0020.
 */
export type BoxConcept = {
  id: string;
  label: string;
  detail: string;
  amount: number;
  origin: ValueOrigin;
  /** What the exogenous report said, when the user changed it. */
  exogenousAmount?: number;
};

/** Boxes whose concepts the user can add, edit and remove. */
export const EDITABLE_BOXES = [
  28, 29, 30, 32, 33, 35, 38, 58, 60, 74, 75, 76, 77, 130, 131, 132, 138,
] as const;
export type EditableBox = (typeof EDITABLE_BOXES)[number];

export const isEditableBox = (box: number): box is EditableBox =>
  (EDITABLE_BOXES as readonly number[]).includes(box);

/** Box 138 holds a count of people, not pesos. */
export const isCountBox = (box: number): boolean => box === 138;

const OTHER_PAYMENTS_ID = 'other-payments';

const single = (
  id: string,
  label: string,
  detail: string,
  amount: number,
  origin: ValueOrigin,
): BoxConcept[] => (amount === 0 ? [] : [{ id, label, detail, amount, origin }]);

const fromIncomeConcepts = (concepts: readonly IncomeConcept[]): BoxConcept[] =>
  concepts.map(concept => ({
    id: concept.id,
    label: concept.label,
    detail: concept.entity,
    amount: concept.amount,
    origin: concept.origin,
    ...(concept.exogenousAmount === undefined ? {} : { exogenousAmount: concept.exogenousAmount }),
  }));

/** Writes box concepts back as income concepts, keeping each one's `financial` flag. */
const toIncomeConcepts = (
  concepts: readonly BoxConcept[],
  current: readonly IncomeConcept[],
  financialByDefault: boolean,
): IncomeConcept[] =>
  concepts.map(concept => {
    const existing = current.find(item => item.id === concept.id);
    const financial = existing ? existing.financial === true : financialByDefault;
    return {
      id: concept.id,
      label: concept.label,
      entity: concept.detail,
      amount: concept.amount,
      origin: concept.origin,
      ...(concept.exogenousAmount === undefined ? {} : { exogenousAmount: concept.exogenousAmount }),
      ...(financial ? { financial: true } : {}),
    };
  });

/** Concepts of an editable box, from the current return. */
export const getBoxConcepts = (box: EditableBox, data: DeclarationData): BoxConcept[] => {
  const employer = data.labor.concepts[0]?.entity ?? '';
  const imported = data.labor.concepts.some(concept => concept.origin === 'exogenous');

  switch (box) {
    case 58:
      return fromIncomeConcepts(data.capital.concepts);
    case 74:
      return fromIncomeConcepts(data.nonLabor.concepts);
    case 60:
      return fromIncomeConcepts(data.capital.costConcepts);
    case 75:
      return fromIncomeConcepts(data.nonLabor.returnConcepts);
    case 76:
      return fromIncomeConcepts(data.nonLabor.contributionConcepts);
    case 77:
      return fromIncomeConcepts(data.nonLabor.costConcepts);
    case 28:
      return single(
        'electronic-invoice',
        '1 % de compras con factura electrónica',
        '',
        data.general.electronicInvoicePurchases,
        'user',
      );
    case 29:
      return data.assets.map(({ id, label, detail, amount, origin }) => ({
        id,
        label,
        detail,
        amount,
        origin,
      }));
    case 30:
      return data.debts.map(({ id, label, detail, amount, origin }) => ({
        id,
        label,
        detail,
        amount,
        origin,
      }));
    case 32: {
      const concepts: BoxConcept[] = data.labor.concepts.map(concept => ({
        id: concept.id,
        label: concept.label,
        detail: concept.entity,
        amount: concept.amount,
        origin: concept.origin,
        ...(concept.exogenousAmount === undefined ? {} : { exogenousAmount: concept.exogenousAmount }),
      }));
      const conceptsTotal = concepts.reduce((sum, concept) => sum + concept.amount, 0);
      if (data.labor.salaries !== conceptsTotal) {
        concepts.push({
          id: 'salary-adjustment',
          label: 'Ajuste a salarios y pagos laborales',
          detail: 'Diferencia con lo que escribiste en Ingresos',
          amount: data.labor.salaries - conceptsTotal,
          origin: 'user',
        });
      }
      if (data.labor.otherPayments > 0) {
        concepts.push({
          id: OTHER_PAYMENTS_ID,
          label: 'Otros pagos laborales',
          detail: 'No incluidos en el certificado',
          amount: data.labor.otherPayments,
          origin: 'user',
        });
      }
      return concepts;
    }
    case 33:
      return single(
        'mandatory-contributions',
        'Aportes obligatorios a pensión, salud y fondo de solidaridad',
        employer,
        data.labor.nonTaxableIncome,
        imported ? 'exogenous' : 'user',
      );
    case 35:
      return single(
        'voluntary-contributions',
        'Aportes voluntarios AFC, FVP y AVC',
        '',
        data.labor.voluntaryContributions,
        'user',
      );
    case 38:
      return single(
        'housing-interest',
        'Intereses del crédito de vivienda',
        data.debts.find(debt => debt.origin === 'exogenous')?.detail.split(' · ')[0] ?? '',
        data.deductions.housingInterestPaid,
        imported ? 'exogenous' : 'user',
      );
    case 130:
      return single(
        'previous-advance',
        'Anticipo liquidado el año anterior',
        '',
        data.previousYearAdvance,
        'user',
      );
    case 131:
      return single(
        'previous-balance',
        'Saldo a favor del año anterior',
        '',
        data.previousBalanceInFavor,
        'user',
      );
    case 132:
      return single(
        'withholdings',
        'Retención en la fuente',
        employer,
        data.withholdings,
        imported ? 'exogenous' : 'user',
      );
    case 138:
      return single('dependents', 'Dependientes económicos', '', data.deductions.dependents, 'user');
  }
};

const total = (concepts: readonly BoxConcept[]) => concepts.reduce((sum, concept) => sum + concept.amount, 0);

/** Writes the edited concepts of a box back to the return. */
export const applyBoxConcepts = (
  box: EditableBox,
  data: DeclarationData,
  concepts: readonly BoxConcept[],
): DeclarationData => {
  switch (box) {
    case 28:
      return { ...data, general: { ...data.general, electronicInvoicePurchases: total(concepts) } };
    case 58:
      return {
        ...data,
        capital: { ...data.capital, concepts: toIncomeConcepts(concepts, data.capital.concepts, true) },
      };
    case 74:
      return {
        ...data,
        nonLabor: { ...data.nonLabor, concepts: toIncomeConcepts(concepts, data.nonLabor.concepts, false) },
      };
    case 60:
      return {
        ...data,
        capital: {
          ...data.capital,
          costConcepts: toIncomeConcepts(concepts, data.capital.costConcepts, false),
        },
      };
    case 75:
      return {
        ...data,
        nonLabor: {
          ...data.nonLabor,
          returnConcepts: toIncomeConcepts(concepts, data.nonLabor.returnConcepts, false),
        },
      };
    case 76:
      return {
        ...data,
        nonLabor: {
          ...data.nonLabor,
          contributionConcepts: toIncomeConcepts(concepts, data.nonLabor.contributionConcepts, false),
        },
      };
    case 77:
      return {
        ...data,
        nonLabor: {
          ...data.nonLabor,
          costConcepts: toIncomeConcepts(concepts, data.nonLabor.costConcepts, false),
        },
      };
    case 29:
      return {
        ...data,
        assets: concepts.map((concept): Asset => {
          const existing = data.assets.find(asset => asset.id === concept.id);
          return {
            id: concept.id,
            kind: existing?.kind ?? 'other',
            label: concept.label,
            detail: concept.detail,
            amount: concept.amount,
            origin: concept.origin,
          };
        }),
      };
    case 30:
      return {
        ...data,
        debts: concepts.map((concept): Debt => ({
          id: concept.id,
          label: concept.label,
          detail: concept.detail,
          amount: concept.amount,
          origin: concept.origin,
        })),
      };
    case 32: {
      const labor = concepts.filter(concept => concept.id !== OTHER_PAYMENTS_ID);
      return {
        ...data,
        labor: {
          ...data.labor,
          concepts: labor.map(concept => ({
            id: concept.id,
            label: concept.label,
            entity: concept.detail,
            amount: concept.amount,
            origin: concept.origin,
            ...(concept.exogenousAmount === undefined ? {} : { exogenousAmount: concept.exogenousAmount }),
          })),
          salaries: total(labor),
          otherPayments: concepts.find(concept => concept.id === OTHER_PAYMENTS_ID)?.amount ?? 0,
        },
      };
    }
    case 33:
      return { ...data, labor: { ...data.labor, nonTaxableIncome: total(concepts) } };
    case 35:
      return { ...data, labor: { ...data.labor, voluntaryContributions: total(concepts) } };
    case 38:
      return { ...data, deductions: { ...data.deductions, housingInterestPaid: total(concepts) } };
    case 130:
      return { ...data, previousYearAdvance: total(concepts) };
    case 131:
      return { ...data, previousBalanceInFavor: total(concepts) };
    case 132:
      return { ...data, withholdings: total(concepts) };
    case 138:
      return {
        ...data,
        deductions: { ...data.deductions, dependents: Math.max(0, Math.round(total(concepts))) },
      };
  }
};

/** Marks a concept as changed by the user, remembering what the exogenous report said. */
export const editConcept = (
  concept: BoxConcept,
  patch: Partial<Pick<BoxConcept, 'label' | 'detail' | 'amount'>>,
): BoxConcept => {
  const changed = { ...concept, ...patch };
  if (concept.origin !== 'exogenous') return changed;
  return { ...changed, origin: 'user', exogenousAmount: concept.amount };
};

const percent = (rate: number) => `${String(Math.round(rate * 10_000) / 100).replace('.', ',')} %`;
const uvt = (value: number) => value.toLocaleString('es-CO');

/** Short explanation of each box for the detail panel, with the selected year's limits. */
export const boxDescription = (box: number, year: TaxYearConfig): string | undefined => {
  const descriptions: Partial<Record<number, string>> = {
    28: `El ${percent(year.general.electronicInvoiceRate)} de lo que compraste con factura electrónica a tu nombre, hasta ${uvt(year.general.electronicInvoiceCapUvt)} UVT.`,
    29: 'Todo lo que tenías al 31 de diciembre: inmuebles, cuentas, vehículos e inversiones.',
    30: 'Lo que debías al 31 de diciembre.',
    32: `Lo que recibiste como persona empleada en ${String(year.year)}, antes de descontar aportes.`,
    33: 'Aportes obligatorios a pensión, salud y fondo de solidaridad. No pagan impuesto.',
    35: 'Aportes voluntarios a cuentas AFC, fondos de pensiones voluntarias (FVP) y ahorro voluntario (AVC).',
    36: `El ${percent(year.labor.exempt25Rate)} exento de tus pagos laborales, calculado sobre lo que queda después de aportes y deducciones, hasta ${uvt(year.labor.exempt25Uvt)} UVT.`,
    38: `Intereses que pagaste por el crédito de vivienda. La casilla toma hasta ${uvt(year.labor.housingInterestUvt)} UVT al año.`,
    58: `Intereses y rendimientos financieros: cuentas, CDT y fondos de inversión. El ${percent(year.general.inflationComponentRate)} de ellos no es renta (casilla 59).`,
    74: 'Otros ingresos que no vienen de tu trabajo ni de tus inversiones.',
    60: 'Costos y gastos de tus rentas de capital: solo los que tengan relación con esos ingresos y estén soportados.',
    75: 'Devoluciones, rebajas y descuentos sobre tus otros ingresos (casilla 74).',
    76: 'Aportes obligatorios a pensión que pagaste como independiente sobre tus otros ingresos. No pagan impuesto.',
    77: 'Costos y gastos de tus otros ingresos: solo los que tengan relación con esos ingresos y estén soportados.',
    39: 'Dependiente económico y medicina prepagada, cada uno con su tope.',
    130: 'El anticipo que liquidaste en tu declaración del año pasado.',
    131: 'El saldo a favor de tu declaración anterior que no pediste en devolución.',
    132: 'Lo que te retuvieron durante el año.',
    138: `Dependientes por los que sumas ${uvt(year.general.additionalDependentUvt)} UVT cada uno a la casilla 92, hasta ${String(year.general.maxAdditionalDependents)}.`,
  };
  return descriptions[box];
};
