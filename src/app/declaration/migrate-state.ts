import { STATE_VERSION } from './declaration-state';
import type { DeclarationState } from './declaration-state';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Brings a saved state from an older version to the current one, when the change only adds
 * fields. Returns null when it cannot be migrated.
 * - 7 → 8: adds the pensions, dividends and occasional gains schedules, empty (ADR 0031).
 * - 8 → 9: adds the fees (honorarios) schedule, empty (ADR 0032).
 * - 9 → 10: adds the taxable year; every earlier state is AG 2025 (ADR 0034).
 */
export const migrateState = (value: unknown): DeclarationState | null => {
  if (!isRecord(value) || !isRecord(value.data)) return null;
  if (value.version === STATE_VERSION) return value as DeclarationState;
  if (value.version !== 7 && value.version !== 8 && value.version !== 9) return null;
  const data = value.data as Partial<DeclarationState['data']>;
  return {
    ...(value as unknown as DeclarationState),
    version: STATE_VERSION,
    taxYear: 2025,
    data: {
      ...(data as DeclarationState['data']),
      pensions: data.pensions ?? { concepts: [], nonTaxableIncome: 0, months: 12 },
      dividends: data.dividends ?? { concepts: [] },
      occasionalGains: data.occasionalGains ?? { concepts: [] },
      fees: data.fees ?? { concepts: [], nonTaxableIncome: 0, costs: 0, option: null },
    },
  };
};
