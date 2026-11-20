import type { ReactNode } from 'react';
import { useMediaQuery } from 'polpo/hooks';

import { UseComputerPage } from '@/features/use-computer/UseComputerPage';

/** Below this width the app shows screen 10 instead of the flow (ADR 0021). */
const SMALL_SCREEN_QUERY = '(max-width: 1279.98px)';

/**
 * The declaration flow needs a computer; the landing and legal pages do not (ADR 0036). Wraps the
 * routes of the app and shows screen 10 on small screens.
 */
export const DesktopOnly = ({ children }: { children: ReactNode }) => {
  const isSmallScreen = useMediaQuery(SMALL_SCREEN_QUERY);
  return isSmallScreen ? <UseComputerPage /> : children;
};
