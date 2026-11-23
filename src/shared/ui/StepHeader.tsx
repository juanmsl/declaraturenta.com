import type { ReactNode } from 'react';

import { useIsCompact } from '@/shared/lib/use-compact';

import { Text } from './Text';

type StepHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Shown next to the title, e.g. a box chip. */
  badge?: ReactNode;
};

/** Question and explanation at the top of a flow screen. */
export const StepHeader = ({ title, description, badge }: StepHeaderProps) => {
  const isCompact = useIsCompact();
  return (
    <header className='flex flex-col gap-3'>
      <div className='flex items-center gap-3'>
        <Text variant='title-l' as='h1'>
          {title}
        </Text>
        {badge}
      </div>
      {description && (
        <Text variant={isCompact ? 'body-m' : 'body-l'} className='max-w-160 text-fg-secondary'>
          {description}
        </Text>
      )}
    </header>
  );
};
