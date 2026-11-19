import type { ReactNode } from 'react';
import { LuCircleHelp } from 'react-icons/lu';

import { Icon } from './Icon';
import { Text } from './Text';

type NoteBoxProps = {
  children: ReactNode;
  /** Small heading. Defaults to "Bueno saber". */
  title?: string;
  /** Shows the help icon next to the title. */
  withIcon?: boolean;
};

/** Neutral side note ("Bueno saber") used in the right panels. */
export const NoteBox = ({ children, title = 'Bueno saber', withIcon = false }: NoteBoxProps) => (
  <div className='flex flex-col gap-1 rounded-md bg-subtle p-4'>
    <div className='flex items-center gap-2 text-fg-secondary'>
      {withIcon && <Icon icon={LuCircleHelp} size={16} />}
      <Text variant='caption' className='text-current'>
        {title}
      </Text>
    </div>
    <Text variant='body-m' className='text-fg-secondary'>
      {children}
    </Text>
  </div>
);
