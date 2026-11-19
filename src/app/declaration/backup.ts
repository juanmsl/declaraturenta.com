import { STATE_VERSION } from './declaration-state';
import { migrateState } from './migrate-state';
import type { DeclarationState } from './declaration-state';

/**
 * Local copy of the declaration (ADR 0027): a readable JSON file the user keeps on their computer
 * and can open later in any browser. It holds personal data; it never leaves the device.
 */
const APP_ID = 'declaraturenta';

type BackupFile = {
  app: typeof APP_ID;
  version: number;
  createdAt: string;
  state: DeclarationState;
};

export class BackupError extends Error {
  readonly reason: 'not-a-backup' | 'outdated';

  constructor(reason: 'not-a-backup' | 'outdated') {
    super(reason);
    this.name = 'BackupError';
    this.reason = reason;
  }
}

export const createBackup = (state: DeclarationState, now: Date): string =>
  JSON.stringify(
    { app: APP_ID, version: STATE_VERSION, createdAt: now.toISOString(), state } satisfies BackupFile,
    null,
    2,
  );

/** "declaraturenta-copia-2026-11-19.json" */
export const backupFileName = (now: Date): string => `${APP_ID}-copia-${now.toISOString().slice(0, 10)}.json`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** Reads a copy. Throws `BackupError` when it is not a copy of this app or comes from an older version. */
export const parseBackup = (text: string): { state: DeclarationState; createdAt: string } => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupError('not-a-backup');
  }
  if (!isRecord(parsed) || parsed.app !== APP_ID || !isRecord(parsed.state))
    throw new BackupError('not-a-backup');
  const state = parsed.version === parsed.state.version ? migrateState(parsed.state) : null;
  if (!state) throw new BackupError('outdated');
  return {
    state,
    createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : '',
  };
};

/** Starts the download of a copy in the browser. */
export const downloadBackup = (state: DeclarationState): void => {
  const now = new Date();
  const url = URL.createObjectURL(new Blob([createBackup(state, now)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = backupFileName(now);
  link.click();
  URL.revokeObjectURL(url);
};
