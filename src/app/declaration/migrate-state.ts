import { STATE_VERSION } from './declaration-state';
import type { DeclarationState } from './declaration-state';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const withoutShouldFile = (steps: unknown): DeclarationState['completedSteps'] =>
  Array.isArray(steps)
    ? (steps.filter(step => step !== 'should-file') as DeclarationState['completedSteps'])
    : [];

/**
 * Brings a saved state from an older version to the current one, when the change only adds
 * fields. Returns null when it cannot be migrated.
 * - 7 → 8: adds the pensions, dividends and occasional gains schedules, empty (ADR 0031).
 * - 8 → 9: adds the fees (honorarios) schedule, empty (ADR 0032).
 * - 9 → 10: adds the taxable year; every earlier state is AG 2025 (ADR 0034).
 * - 10 → 11: the app starts empty (ADR 0035). A state still showing the fictional sample taxpayer
 *   is dropped; the others lose `isSample`, get `vatResponsible: false` and forget «should-file».
 */
export const migrateState = (value: unknown): DeclarationState | null => {
  if (!isRecord(value) || !isRecord(value.data)) return null;
  if (value.version === STATE_VERSION) return value as DeclarationState;
  if (typeof value.version !== 'number' || value.version < 7 || value.version > 10) return null;
  if (!isRecord(value.taxpayer) || value.taxpayer.isSample === true) return null;
  const taxpayer = { ...value.taxpayer };
  delete taxpayer.isSample;
  const data = value.data as Partial<DeclarationState['data']>;
  const obligation = (data.obligation ?? {}) as Partial<DeclarationState['data']['obligation']>;
  return {
    ...(value as unknown as DeclarationState),
    version: STATE_VERSION,
    taxYear: typeof value.taxYear === 'number' ? value.taxYear : 2025,
    taxpayer: taxpayer as unknown as DeclarationState['taxpayer'],
    // «¿Debo declarar?» left the flow (ADR 0035).
    completedSteps: withoutShouldFile(value.completedSteps),
    visitedSteps: withoutShouldFile(value.visitedSteps),
    data: {
      ...(data as DeclarationState['data']),
      obligation: {
        creditCardPurchases: obligation.creditCardPurchases ?? 0,
        totalPurchases: obligation.totalPurchases ?? 0,
        deposits: obligation.deposits ?? 0,
        vatResponsible: obligation.vatResponsible ?? false,
      },
      pensions: data.pensions ?? { concepts: [], nonTaxableIncome: 0, months: 12 },
      dividends: data.dividends ?? { concepts: [] },
      occasionalGains: data.occasionalGains ?? { concepts: [] },
      fees: data.fees ?? { concepts: [], nonTaxableIncome: 0, costs: 0, option: null },
    },
  };
};
