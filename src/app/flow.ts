/**
 * The sections of the declaration flow, in the order of the Formulario 210 (patrimonio before
 * ingresos, ADR 0045) (ADR 0035: «¿Debo declarar?» moved to the landing). Single source of truth for
 * the side rail, the home journey list and the routes.
 * Paths are user-facing, so they are in Spanish.
 */
export type FlowStepId =
  'exogenous' | 'income' | 'assets' | 'deductions' | 'adjustments' | 'result' | 'draft-210';

export type FlowStep = {
  id: FlowStepId;
  path: `/${string}`;
  /** Section name in the journey list and the top bar. */
  title: string;
  /** Shorter name for the side rail when it differs from `title`. */
  railLabel: string;
  /** One-line summary shown in the home journey list. */
  summary: string;
  /** Estimated minutes to complete. */
  minutes: number;
};

export const FLOW_STEPS = [
  {
    id: 'exogenous',
    path: '/exogena',
    title: 'Importar exógena',
    railLabel: 'Importar exógena',
    summary: 'Subes el reporte de la DIAN y lo leemos por ti.',
    minutes: 3,
  },
  {
    id: 'assets',
    path: '/patrimonio',
    title: 'Patrimonio',
    railLabel: 'Patrimonio',
    summary: 'Bienes, cuentas y deudas al 31 de diciembre.',
    minutes: 4,
  },
  {
    id: 'income',
    path: '/ingresos',
    title: 'Ingresos',
    railLabel: 'Ingresos',
    summary: 'Confirmas salarios, honorarios y otros ingresos.',
    minutes: 5,
  },
  {
    id: 'deductions',
    path: '/deducciones',
    title: 'Deducciones y exentas',
    railLabel: 'Deducciones',
    summary: 'Vivienda, dependientes, salud y aportes.',
    minutes: 6,
  },
  {
    id: 'adjustments',
    path: '/otros-ajustes',
    title: 'Otros ajustes',
    railLabel: 'Otros ajustes',
    summary: 'Pérdidas, renta presuntiva e impuestos del exterior.',
    minutes: 2,
  },
  {
    id: 'result',
    path: '/resultado',
    title: 'Resultado',
    railLabel: 'Resultado',
    summary: 'Ves el cálculo paso a paso.',
    minutes: 2,
  },
  {
    id: 'draft-210',
    path: '/borrador-210',
    title: 'Borrador 210',
    railLabel: 'Borrador 210',
    summary: 'Revisas el formulario renglón por renglón.',
    minutes: 3,
  },
] as const satisfies readonly FlowStep[];

const STEPS_BY_ID = new Map<FlowStepId, FlowStep>(FLOW_STEPS.map(step => [step.id, step]));

/** A step by its id, so screens do not depend on the order of the flow. */
export const getStep = (id: FlowStepId): FlowStep => {
  const step = STEPS_BY_ID.get(id);
  if (!step) throw new Error(`Unknown flow step: ${id}`);
  return step;
};

export const findStepByPath = (pathname: string): FlowStep | undefined =>
  FLOW_STEPS.find(step => pathname === step.path || pathname.startsWith(`${step.path}/`));

/** Landing page: the first route of app.declaraturenta.com (ADR 0036). */
export const LANDING_PATH = '/';

/** Inicio, the summary before the flow (screen 01). */
export const HOME_PATH = '/inicio';

/** Legal pages (screens 16b and 16c). */
export const TERMS_PATH = '/terminos';
export const PRIVACY_PATH = '/privacidad';

/** Full Formulario 210 view (screen 09). `?casilla=N` opens the detail of box N (screen 09b). */
export const FORM_210_PATH = '/formulario-210';

/** Step to resume the declaration from: the first one not completed, or the draft when all are done. */
export const findResumeStep = (completed: readonly FlowStepId[]): FlowStep =>
  FLOW_STEPS.find(step => !completed.includes(step.id)) ?? getStep('draft-210');
