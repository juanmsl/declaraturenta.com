import { cn } from 'polpo/helpers';

import { Diamond } from './Diamond';
import type { ProgressState } from './Diamond';

type BraidProps = {
  states: readonly ProgressState[];
  /** Accessible description of the progress, e.g. "Paso 3 de 7". */
  label: string;
};

/**
 * The compact "trenza" (Figma "Trenza/Paso"): one diamond per flow step joined by a thread.
 * The thread after a completed step is sun; the rest is the base line.
 */
export const Braid = ({ states, label }: BraidProps) => {
  const completed = states.filter(state => state === 'done').length;

  return (
    <div
      role='progressbar'
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={states.length}
      aria-valuenow={completed}
      className='flex items-center'
    >
      {states.map((state, index) => (
        <div key={index} className='flex items-center'>
          <Diamond state={state} />
          {index < states.length - 1 && (
            <span aria-hidden className={cn('h-0.5 w-4', state === 'done' ? 'bg-sun' : 'bg-line')} />
          )}
        </div>
      ))}
    </div>
  );
};
