import type { CSSProperties } from 'react';

/** Class and order of a child of a `RevealSection`: lower indexes enter first. */
export const revealItem = (index: number) => ({
  className: 'reveal-item',
  style: { '--reveal-index': index } as CSSProperties,
});
