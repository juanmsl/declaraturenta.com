import { NavLink } from 'react-router';
import { cn } from 'polpo/helpers';

import { Diamond, Text } from '@/shared/ui';
import type { ProgressState } from '@/shared/ui';

const META: Partial<Record<ProgressState, string>> = {
  done: 'Listo',
  current: 'En curso',
};

type SideRailItemProps = {
  to: string;
  label: string;
  state: ProgressState;
};

/** Figma "Riel/Item": one section of the 210 in the side rail. */
export const SideRailItem = ({ to, label, state }: SideRailItemProps) => {
  const meta = META[state];

  return (
    <NavLink
      to={to}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-3 py-2.5 transition-colors duration-150',
        'outline-none focus-visible:ring-2 focus-visible:ring-line-action',
        state === 'current' ? 'bg-surface shadow-raised' : 'hover:bg-action-soft/60',
      )}
    >
      <Diamond state={state} />
      <Text
        as='span'
        variant={state === 'current' ? 'body-m-strong' : 'body-m'}
        className={cn(
          'min-w-0 flex-1',
          state === 'done' && 'text-fg-secondary',
          state === 'current' && 'text-fg',
          state === 'pending' && 'text-fg-muted',
        )}
      >
        {label}
      </Text>
      {meta && (
        <Text variant='note' className={state === 'current' ? 'text-fg-action' : 'text-fg-muted'}>
          {meta}
        </Text>
      )}
    </NavLink>
  );
};
