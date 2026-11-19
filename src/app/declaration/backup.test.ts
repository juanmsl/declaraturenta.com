import { BackupError, backupFileName, createBackup, parseBackup } from './backup';
import { createInitialState } from './declaration-state';

describe('local copy', () => {
  const now = new Date('2026-11-19T15:00:00Z');

  it('round-trips the whole state', () => {
    const state = createInitialState();
    const { state: restored, createdAt } = parseBackup(createBackup(state, now));
    expect(restored).toEqual(state);
    expect(createdAt).toBe('2026-11-19T15:00:00.000Z');
  });

  it('names the file with the date', () => {
    expect(backupFileName(now)).toBe('declaraturenta-copia-2026-11-19.json');
  });

  it('rejects other files and older versions', () => {
    expect(() => parseBackup('no es json')).toThrow(BackupError);
    expect(() => parseBackup(JSON.stringify({ app: 'otra', state: {} }))).toThrow(BackupError);
    const old = JSON.parse(createBackup(createInitialState(), now)) as { version: number };
    old.version = 1;
    expect(() => parseBackup(JSON.stringify(old))).toThrow('outdated');
  });
});
