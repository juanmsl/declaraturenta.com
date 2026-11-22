import { LuCheck } from 'react-icons/lu';

import { formatTimeAgo } from '@/shared/lib/format';
import { useNow } from '@/shared/lib/useNow';
import { Icon, Text } from '@/shared/ui';

import { useDeclaration } from '../declaration/declaration-context';

import { CopyMenu } from './CopyMenu';
import { HelpButton } from './HelpButton';
import { ViewSwitcher } from './ViewSwitcher';

/**
 * Figma "Barra superior": view switcher, save status, «Mis datos» and help. The braid and «Paso X
 * de 7» left it; the side rail shows where you are and the progress (ADR 0058).
 */
export const TopBar = () => {
  const { state } = useDeclaration();
  const now = useNow();

  return (
    <header className='flex h-18 shrink-0 items-center gap-6 border-b border-line bg-canvas pr-8 pl-10'>
      <ViewSwitcher view='steps' />
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
