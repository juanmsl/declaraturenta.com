import { useState } from 'react';
import type { ReactNode } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { cn } from 'polpo/helpers';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { formatCurrency } from '@/shared/lib/format';
import { Icon, Text } from '@/shared/ui';

import { FiguresDrawer } from './FiguresDrawer';

type EstimatePanelProps = {
  /** Short note under the estimated balance; it depends on the screen. */
  note: ReactNode;
  /** Breakdown rows (CalcRow) for this screen. */
  children: ReactNode;
  /** Extra content under the breakdown, e.g. a "Bueno saber" box. */
  footer?: ReactNode;
};

/** Right panel "Así va tu declaración" with the live estimate (Figma screens 04–06). */
export const EstimatePanel = ({ note, children, footer }: EstimatePanelProps) => {
  const { estimate } = useDeclaration();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toPay = estimate.balance > 0;

  return (
    <>
      <Text variant='title-s' as='h2'>
        Así va tu declaración
      </Text>
      <section
        aria-live='polite'
        className={cn('flex flex-col gap-1 rounded-lg p-5', toPay ? 'bg-coral-soft' : 'bg-mint-soft')}
      >
        <Text variant='caption' className={toPay ? 'text-fg-error' : 'text-fg-success'}>
          {toPay ? 'Saldo a pagar estimado' : 'Saldo a favor estimado'}
        </Text>
        <Text variant='figure-xl'>
          {formatCurrency(toPay ? estimate.amountToPay : estimate.amountInFavor)}
        </Text>
        <Text variant='note' className='text-fg-secondary'>
          {note}
        </Text>
      </section>
      <div className='flex flex-col'>{children}</div>
      {footer}
      <button
        type='button'
        onClick={() => {
          setIsDrawerOpen(true);
        }}
        className='flex w-fit cursor-pointer items-center gap-1.5 rounded-sm text-fg-action hover:underline focus-visible:ring-2 focus-visible:ring-line-action focus-visible:outline-none'
      >
        <Text as='span' variant='caption' className='text-current'>
          ¿De dónde sale cada cifra?
        </Text>
        <Icon icon={LuChevronRight} size={16} />
      </button>
      <FiguresDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
        }}
      />
    </>
  );
};
