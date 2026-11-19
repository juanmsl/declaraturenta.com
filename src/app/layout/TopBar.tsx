import { LuCheck } from 'react-icons/lu';

import { formatTimeAgo } from '@/shared/lib/format';
import { useNow } from '@/shared/lib/useNow';
import { Braid, Button, Icon, Text } from '@/shared/ui';

import { useDeclaration } from '../declaration/declaration-context';
import { useHelp } from '../help/help-context';

import { CopyMenu } from './CopyMenu';
import type { StepProgress } from './useFlowProgress';

type TopBarProps = {
  /** Where the user is, e.g. "Paso 3 de 7 · Ingresos". */
  location: string;
  steps: StepProgress[];
};

/** Figma "Barra superior": current step, braid progress, save status and help. */
export const TopBar = ({ location, steps }: TopBarProps) => {
  const { state } = useDeclaration();
  const now = useNow();
  const { openHelp } = useHelp();

  return (
    <header className='flex h-18 shrink-0 items-center gap-6 border-b border-line bg-canvas pr-8 pl-10'>
      <Text variant='caption' className='shrink-0 text-fg-secondary'>
        {location}
      </Text>
      <div className='min-w-0'>
        <Braid states={steps.map(step => step.state)} label={`Progreso de tu declaración: ${location}`} />
      </div>
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
      <Button
        variant='ghost'
        type='button'
        className='shrink-0'
        onClick={() => {
          openHelp('guide');
        }}
      >
        Ayuda
      </Button>
    </header>
  );
};
