import { useRef, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { useIntersectionObserver } from 'polpo/hooks';

/**
 * Landing section whose children marked with `reveal-item` fade in, in order, the first time the
 * section scrolls into view (ADR 0043). Styles in `src/styles/motion.css`.
 */
export const RevealSection = (props: ComponentPropsWithoutRef<'section'>) => {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useIntersectionObserver(
    ref,
    entries => {
      if (entries.some(entry => entry.isIntersecting)) setShown(true);
    },
    { threshold: 0.12 },
  );

  return <section ref={ref} data-reveal={shown ? 'in' : 'out'} {...props} />;
};
