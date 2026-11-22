import { LuCheck } from 'react-icons/lu';

import { formatTimeAgo } from '@/shared/lib/format';
import { useNow } from '@/shared/lib/useNow';
import { Icon, Text } from '@/shared/ui';

import { useDeclaration } from '../declaration/declaration-context';

import { CopyMenu } from './CopyMenu';
import { HelpButton } from './HelpButton';
import { ViewSwitcher } from './ViewSwitcher';

type TopBarProps = {
  /** Where the user is, e.g. "Paso 3 de 7 · Ingresos". */
  location: string;
};

/**
 * Figma "Barra superior": view switcher, current step, save status and help. The braid left it;
 * the side rail shows the progress (ADR 0058).
 */
export const TopBar = ({ location }: TopBarProps) => {
  const { state } = useDeclaration();
  const now = useNow();

  return (
    <header className='flex h-18 shrink-0 items-center gap-6 border-b border-line bg-canvas pr-8 pl-10'>
      <ViewSwitcher view='steps' />
      <Text variant='caption' className='shrink-0 text-fg-secondary'>
        {location}
      </Text>
      <div className='min-w-2.5 flex-1' />
      {state.savedAt && (
        <div className='flex shrink-0 items-center gap-1.5' role='status'>
          <Icon icon={LuCheck} size={14} className='text-fg-success' />
          <Text variant='note' className='text-fg-muted'>
            Guardado {formatTimeAgo(new Date(state.savedAt), now)}
          </Text>
        </div>
      )}
      <CopyMenu />
      <HelpButton />
    </header>
  );
};
