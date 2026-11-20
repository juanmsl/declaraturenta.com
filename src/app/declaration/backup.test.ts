import { BackupError, backupFileName, createBackup, parseBackup } from './backup';
import { createInitialState } from './declaration-state';

describe('local copy', () => {
  const now = new Date('2026-11-19T15:00:00Z');

  it('round-trips the whole state', () => {
    const state = createInitialState();
    const { state: restored, createdAt } = parseBackup(createBackup(state, now), 2025);
    expect(restored).toEqual(state);
    expect(createdAt).toBe('2026-11-19T15:00:00.000Z');
  });

  it('names the file with the date', () => {
    expect(backupFileName(now, 2025)).toBe('declaraturenta-ag2025-copia-2026-11-19.json');
  });

  it('rejects other files and older versions', () => {
    expect(() => parseBackup('no es json', 2025)).toThrow(BackupError);
    expect(() => parseBackup(JSON.stringify({ app: 'otra', state: {} }), 2025)).toThrow(BackupError);
    const old = JSON.parse(createBackup(createInitialState(), now)) as { version: number };
    old.version = 1;
    expect(() => parseBackup(JSON.stringify(old), 2025)).toThrow('outdated');
  });

  it('rejects a copy of another tax year', () => {
    const copy = createBackup(createInitialState(), now);
    expect(() => parseBackup(copy, 2026)).toThrow(BackupError);
  });
});
