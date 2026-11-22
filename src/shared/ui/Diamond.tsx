import { cn } from 'polpo/helpers';

/** Progress state shared by the rail and the journey list. */
export type ProgressState = 'done' | 'current' | 'pending';

type DiamondProps = {
  state: ProgressState;
  size?: number;
  className?: string;
};

/**
 * The caña flecha diamond ("rombo"). Only used for progress: the side rail, the journey list
 * and the isotype. Never as decoration elsewhere.
 */
export const Diamond = ({ state, size = 12, className }: DiamondProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 12 12'
    aria-hidden
    className={cn(
      'shrink-0',
      state === 'done' && 'fill-ink',
      state === 'current' && 'fill-action',
      state === 'pending' && 'fill-none stroke-line-strong',
      className,
    )}
  >
    {state === 'pending' ? (
      <path d='M6 1.06 10.94 6 6 10.94 1.06 6Z' strokeWidth={1.5} />
    ) : (
      <path d='M6 0 12 6 6 12 0 6Z' />
    )}
  </svg>
);
