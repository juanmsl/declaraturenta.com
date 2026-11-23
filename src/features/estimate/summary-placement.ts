import { useCallback, useSyncExternalStore } from 'react';

/**
 * Where phones and tablets show «Así va tu declaración» (Figma M04c, ADR 0060): a bar stuck to the
 * bottom (default), at the end of each step, or only in Resultado. Saved in this browser.
 */
export type SummaryPlacement = 'bar' | 'end' | 'result';

export const SUMMARY_PLACEMENTS: readonly { value: SummaryPlacement; title: string; description: string }[] =
  [
    { value: 'bar', title: 'Barra fija abajo', description: 'Siempre a la vista mientras llenas cada paso.' },
    {
      value: 'end',
      title: 'Al final de cada paso',
      description: 'Debajo del contenido, antes de los botones.',
    },
    { value: 'result', title: 'Solo en Resultado', description: 'No se muestra en los demás pasos.' },
  ];

const STORAGE_KEY = 'declaraturenta:summary-placement';
const DEFAULT_PLACEMENT: SummaryPlacement = 'bar';
const listeners = new Set<() => void>();
/** Last choice, for browsers without storage. */
let memory: SummaryPlacement | null = null;

const isPlacement = (value: unknown): value is SummaryPlacement =>
  SUMMARY_PLACEMENTS.some(option => option.value === value);

const read = (): SummaryPlacement => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isPlacement(stored) ? stored : (memory ?? DEFAULT_PLACEMENT);
  } catch {
    return memory ?? DEFAULT_PLACEMENT;
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useSummaryPlacement = (): [SummaryPlacement, (value: SummaryPlacement) => void] => {
  const placement = useSyncExternalStore(subscribe, read, () => DEFAULT_PLACEMENT);
  const setPlacement = useCallback((value: SummaryPlacement) => {
    memory = value;
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Without storage the choice lasts until the page reloads.
    }
    listeners.forEach(listener => {
      listener();
    });
  }, []);
  return [placement, setPlacement];
};
