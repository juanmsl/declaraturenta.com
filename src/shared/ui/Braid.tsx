import { BraidSegment } from './BraidSegment';
import type { ProgressState } from './Diamond';

type BraidProps = {
  states: readonly ProgressState[];
  /** Accessible description of the progress, e.g. "Paso 3 de 7". */
  label: string;
};

/** The "trenza": one woven segment per flow section. */
export const Braid = ({ states, label }: BraidProps) => {
  const completed = states.filter(state => state === 'done').length;

  return (
    <div
      role='progressbar'
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={states.length}
      aria-valuenow={completed}
      className='flex items-center gap-1 overflow-clip'
    >
      {states.map((state, index) => (
        <BraidSegment key={index} state={state} />
      ))}
    </div>
  );
};
