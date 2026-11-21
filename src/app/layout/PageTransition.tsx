import { useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';

import { FLOW_STEPS } from '../flow';

type TransitionKind = 'none' | 'fade' | 'forward' | 'back';

const kindBetween = (from: string, to: string): TransitionKind => {
  const previous = FLOW_STEPS.findIndex(step => step.path === from);
  const next = FLOW_STEPS.findIndex(step => step.path === to);
  if (previous >= 0 && next >= 0 && previous !== next) return next > previous ? 'forward' : 'back';
  return 'fade';
};

type PageTransitionProps = {
  children: ReactNode;
  /** Remounts (and animates) the content when it changes. Defaults to the pathname. */
  transitionKey?: string;
  /** Between steps of the flow the content slides; elsewhere it fades in (ADR 0043). */
  steps?: boolean;
  /** Animates the first render too. */
  animateOnMount?: boolean;
  className?: string;
};

/** Entrance animation of the content when the route changes (ADR 0043). */
export const PageTransition = ({
  children,
  transitionKey,
  steps = false,
  animateOnMount = false,
  className = '',
}: PageTransitionProps) => {
  const { pathname } = useLocation();
  const key = transitionKey ?? pathname;
  const [current, setCurrent] = useState<{ key: string; path: string; kind: TransitionKind }>({
    key,
    path: pathname,
    kind: animateOnMount ? 'fade' : 'none',
  });

  if (current.key !== key) {
    setCurrent({ key, path: pathname, kind: steps ? kindBetween(current.path, pathname) : 'fade' });
  } else if (current.path !== pathname) {
    setCurrent({ ...current, path: pathname });
  }

  return (
    <div
      key={current.key}
      className={`${current.kind === 'none' ? '' : `page-enter-${current.kind}`} ${className}`.trim()}
    >
      {children}
    </div>
  );
};
