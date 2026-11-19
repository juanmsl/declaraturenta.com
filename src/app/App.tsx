import { RouterProvider } from 'react-router/dom';
import { useMediaQuery } from 'polpo/hooks';

import { UseComputerPage } from '@/features/use-computer/UseComputerPage';

import { DeclarationProvider } from './declaration/DeclarationProvider';
import { router } from './router';

/** Below this width the app shows screen 10 instead of the flow (ADR 0021). */
const SMALL_SCREEN_QUERY = '(max-width: 1279.98px)';

export const App = () => {
  const isSmallScreen = useMediaQuery(SMALL_SCREEN_QUERY);

  return (
    <DeclarationProvider>
      {isSmallScreen ? <UseComputerPage /> : <RouterProvider router={router} />}
    </DeclarationProvider>
  );
};
