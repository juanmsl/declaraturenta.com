import { useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { LuChevronRight, LuChevronUp } from 'react-icons/lu';
import { cn } from 'polpo/helpers';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { formatCurrency } from '@/shared/lib/format';
import { Button, Icon, Sheet, Text, useStepLayout } from '@/shared/ui';

import { FiguresDrawer } from './FiguresDrawer';
import { SummaryPlacementOptions } from './SummaryPlacementOptions';
import { useSummaryPlacement } from './summary-placement';

type EstimatePanelProps = {
  /** Short note under the estimated balance; it depends on the screen. */
  note: ReactNode;
  /** Breakdown rows (CalcRow) for this screen. */
  children: ReactNode;
  /** Extra content under the breakdown, e.g. a "Bueno saber" box. */
  footer?: ReactNode;
  /** Shows the "¿De dónde sale cada cifra?" link (Figma screen 04). */
  showFiguresLink?: boolean;
};

const TITLE = 'Así va tu declaración';

/** Estimated balance: what is shown in the panel, the sheet and the summary bar. */
const useBalance = () => {
  const { estimate } = useDeclaration();
  const toPay = estimate.balance > 0;
  return {
    toPay,
    label: toPay ? 'Saldo a pagar estimado' : 'Saldo a favor estimado',
    amount: formatCurrency(toPay ? estimate.amountToPay : estimate.amountInFavor),
  };
};

/** Balance box, breakdown and extras of «Así va tu declaración». */
const EstimateBody = ({ note, children, footer, showFiguresLink = false }: EstimatePanelProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const balance = useBalance();

  return (
    <>
      <section
        aria-live='polite'
        className={cn('flex flex-col gap-1 rounded-lg p-5', balance.toPay ? 'bg-coral-soft' : 'bg-mint-soft')}
      >
        <Text variant='caption' className={balance.toPay ? 'text-fg-error' : 'text-fg-success'}>
          {balance.label}
        </Text>
        <Text variant='figure-xl'>{balance.amount}</Text>
        <Text variant='note' className='text-fg-secondary'>
          {note}
        </Text>
      </section>
      <div className='flex flex-col'>{children}</div>
      {footer}
      {showFiguresLink && (
        <>
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
      )}
    </>
  );
};

/** Sheet with the whole estimate and where to show it (Figma M04c). */
const SummarySheet = ({
  isOpen,
  onClose,
  ...props
}: EstimatePanelProps & { isOpen: boolean; onClose: () => void }) => (
  <Sheet isOpen={isOpen} onClose={onClose} title={TITLE}>
    <EstimateBody {...props} />
    <hr className='m-0 border-0 border-t border-line' />
    <SummaryPlacementOptions onChange={onClose} />
  </Sheet>
);

/** Figma «Resumen fijo»: the estimated balance stuck to the bottom of the step (M04). */
const SummaryBar = (props: EstimatePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const balance = useBalance();

  return (
    <>
      <button
        type='button'
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(true);
        }}
        className={cn(
          'flex w-full cursor-pointer border-t px-4 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-line-action focus-visible:ring-inset md:px-8',
          balance.toPay ? 'border-coral/30 bg-coral-soft' : 'border-mint/30 bg-mint-soft',
        )}
      >
        {/* Same width as the step column on tablets. */}
        <span className='mx-auto flex w-full max-w-164 items-center gap-3'>
          <span className='flex min-w-0 flex-1 flex-col' aria-live='polite'>
            <Text as='span' variant='note' className={balance.toPay ? 'text-fg-error' : 'text-fg-success'}>
              {balance.label}
            </Text>
            <Text as='span' variant='figure-l'>
              {balance.amount}
            </Text>
          </span>
          <span className='flex shrink-0 items-center gap-1 text-fg-action'>
            <Text as='span' variant='caption' className='text-current'>
              Ver detalle
            </Text>
            <Icon icon={LuChevronUp} size={16} />
          </span>
        </span>
      </button>
      <SummarySheet
        {...props}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      />
    </>
  );
};

/** «Al final de cada paso»: the panel before the step actions (the layout puts it in a card). */
const SummaryCard = (props: EstimatePanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Text variant='title-s' as='h2'>
        {TITLE}
      </Text>
      <EstimateBody {...props} />
      <Button
        type='button'
        variant='ghost'
        className='self-start px-0'
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Cambiar dónde ver el resumen
      </Button>
      <Sheet
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        title='Mostrar el resumen'
      >
        <SummaryPlacementOptions
          showLabel={false}
          onChange={() => {
            setIsOpen(false);
          }}
        />
      </Sheet>
    </>
  );
};

/**
 * «Así va tu declaración» with the live estimate (Figma screens 04–06): the right panel on a
 * computer; on phones and tablets a bar, a card at the end of the step or nothing, as the person
 * chose (Figma M04c, ADR 0060).
 */
export const EstimatePanel = (props: EstimatePanelProps) => {
  const layout = useStepLayout();
  const [placement] = useSummaryPlacement();

  if (layout?.compact) {
    if (placement === 'bar')
      return layout.barSlot ? createPortal(<SummaryBar {...props} />, layout.barSlot) : null;
    if (placement === 'end') return <SummaryCard {...props} />;
    return null;
  }

  return (
    <>
      <Text variant='title-s' as='h2'>
        {TITLE}
      </Text>
      <EstimateBody {...props} />
    </>
  );
};
