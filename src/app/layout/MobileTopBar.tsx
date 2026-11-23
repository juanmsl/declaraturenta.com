import { useState } from 'react';
import { LuChevronDown, LuList } from 'react-icons/lu';
import { Link } from 'react-router';

import { Icon, Logo, Text } from '@/shared/ui';

import { FLOW_STEPS, HOME_PATH } from '../flow';

import { MenuSheet } from './MenuSheet';
import { StepsSheet } from './StepsSheet';
import type { StepProgress } from './useFlowProgress';

type MobileTopBarProps = {
  steps: StepProgress[];
  currentStep: StepProgress | undefined;
};

/**
 * Figma «Barra superior · Móvil» (199:13535): isotype to Inicio, where you are (opens the steps)
 * and the menu. Phones and tablets (ADR 0060).
 */
export const MobileTopBar = ({ steps, currentStep }: MobileTopBarProps) => {
  const [open, setOpen] = useState<'steps' | 'menu' | null>(null);
  const close = () => {
    setOpen(null);
  };
  const location = currentStep
    ? `Paso ${String(currentStep.index + 1)} de ${String(FLOW_STEPS.length)} · ${currentStep.railLabel}`
    : 'Inicio';

  return (
    <header className='sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-canvas pr-2 pl-4'>
      <Link
        to={HOME_PATH}
        aria-label='Inicio'
        className='shrink-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-line-action'
      >
        <Logo version='isotype' size={28} decorative />
      </Link>
      <button
        type='button'
        aria-haspopup='dialog'
        aria-expanded={open === 'steps'}
        onClick={() => {
          setOpen('steps');
        }}
        className='flex min-w-0 flex-1 cursor-pointer items-center gap-1 rounded-sm py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-line-action'
      >
        <Text as='span' variant='body-m-strong' className='truncate'>
          {location}
        </Text>
        <Icon icon={LuChevronDown} size={16} className='shrink-0' />
      </button>
      <button
        type='button'
        aria-label='Menú'
        aria-haspopup='dialog'
        aria-expanded={open === 'menu'}
        onClick={() => {
          setOpen('menu');
        }}
        className='flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg outline-none hover:bg-subtle focus-visible:ring-2 focus-visible:ring-line-action'
      >
        <Icon icon={LuList} size={22} />
      </button>
      <StepsSheet isOpen={open === 'steps'} onClose={close} steps={steps} />
      <MenuSheet isOpen={open === 'menu'} onClose={close} />
    </header>
  );
};
