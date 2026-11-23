import type { ReactNode } from 'react';

import { UseComputerPage } from '@/features/use-computer/UseComputerPage';
import { useIsCompact } from '@/shared/lib/use-compact';

/**
 * The full Formulario 210 (screen 09) needs a computer; the steps work on phones and tablets since
 * ADR 0060. Shows screen 10 below 1280 px (ADR 0021).
 */
export const DesktopOnly = ({ children }: { children: ReactNode }) => {
  const isSmallScreen = useIsCompact();
  return isSmallScreen ? <UseComputerPage /> : children;
};
