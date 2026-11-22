import { useMediaQuery } from 'polpo/hooks';

/**
 * Below 1280 px the app uses the compact layout (ADR 0060): phone and tablet share the top bar
 * with sheets, one column and the summary bar. The full Formulario 210 still needs a computer.
 */
export const COMPACT_QUERY = '(max-width: 1279.98px)';

export const useIsCompact = (): boolean => useMediaQuery(COMPACT_QUERY);
