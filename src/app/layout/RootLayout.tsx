import { Outlet, ScrollRestoration, useLocation } from 'react-router';

import { FLOW_STEPS, HOME_PATH } from '../flow';
import { PageTransition } from './PageTransition';

/** Routes inside the app shell (side rail and top bar), which animates only its content. */
const SHELL_PATHS = new Set<string>([HOME_PATH, ...FLOW_STEPS.map(step => step.path)]);

/**
 * Root of every route (ADR 0043): each new navigation starts at the top and «Atrás» goes back to
 * where the person was; pages fade in, while the app shell keeps still and animates its content.
 */
export const RootLayout = () => {
  const { pathname } = useLocation();

  return (
    <>
      <PageTransition transitionKey={SHELL_PATHS.has(pathname) ? 'app' : pathname} animateOnMount>
        <Outlet />
      </PageTransition>
      <ScrollRestoration />
    </>
  );
};
