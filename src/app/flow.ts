/**
 * The seven sections of the declaration flow, in order. Single source of truth for
 * the side rail, the top bar braid, the home journey list and the routes.
 * Paths are user-facing, so they are in Spanish.
 */
export type FlowStepId =
  'should-file' | 'exogenous' | 'income' | 'assets' | 'deductions' | 'result' | 'draft-210';

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
    id: 'should-file',
    path: '/debo-declarar',
    title: '¿Debo declarar?',
    railLabel: '¿Debo declarar?',
    summary: 'Revisamos los cinco topes con tus datos.',
    minutes: 2,
  },
  {
    id: 'exogenous',
    path: '/exogena',
    title: 'Importar exógena',
    railLabel: 'Importar exógena',
    summary: 'Subes el reporte de la DIAN y lo leemos por ti.',
    minutes: 3,
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
    id: 'assets',
    path: '/patrimonio',
    title: 'Patrimonio',
    railLabel: 'Patrimonio',
    summary: 'Bienes, cuentas y deudas al 31 de diciembre.',
    minutes: 4,
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

export const findStepByPath = (pathname: string): FlowStep | undefined =>
  FLOW_STEPS.find(step => pathname === step.path || pathname.startsWith(`${step.path}/`));

/** Full Formulario 210 view (screen 09). `?casilla=N` opens the detail of box N (screen 09b). */
export const FORM_210_PATH = '/formulario-210';
