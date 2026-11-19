import { cn } from 'polpo/helpers';

import type { ProgressState } from './Diamond';

const DIAMOND_X = [7, 18, 29, 40, 51, 62, 73];

const diamondPath = (cx: number) => `M${cx} 1L${cx + 4} 5L${cx} 9L${cx - 4} 5Z`;

type BraidSegmentProps = {
  state: ProgressState;
  className?: string;
};

/**
 * One segment of the "trenza" progress bar (Figma "Trenza/Segmento", 80×10).
 * Done = sun, current = violet (half woven), pending = grey.
 */
export const BraidSegment = ({ state, className }: BraidSegmentProps) => (
  <svg
    width={80}
    height={10}
    viewBox='0 0 80 10'
    fill='none'
    aria-hidden
    className={cn('shrink-0', className)}
  >
    <rect
      width={80}
      height={10}
      rx={3}
      className={cn(
        state === 'done' && 'fill-sun',
        state === 'current' && 'fill-action-soft',
        state === 'pending' && 'fill-subtle',
      )}
    />
    {DIAMOND_X.map((cx, index) => {
      if (state === 'done') {
        return (
          <path
            key={cx}
            d={diamondPath(cx)}
            className={index % 2 === 0 ? 'fill-ink' : 'fill-black opacity-55'}
          />
        );
      }
      if (state === 'current') {
        if (cx > 44) {
          return (
            <path
              key={cx}
              d={`M${cx + 3.1152} 5L${cx} 8.1152L${cx - 3.1152} 5L${cx} 1.8848Z`}
              className='stroke-action'
              strokeWidth={1.25}
            />
          );
        }
        return (
          <path
            key={cx}
            d={diamondPath(cx)}
            className={index % 2 === 0 ? 'fill-action' : 'fill-action-soft'}
          />
        );
      }
      return <path key={cx} d={diamondPath(cx)} className='fill-line-strong' />;
    })}
  </svg>
);
