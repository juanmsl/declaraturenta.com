import { LuChevronRight } from 'react-icons/lu';
import { cn } from 'polpo/helpers';

import type { Form210Box } from '@/domain/form-210';

import { formatCurrency, formatNumber } from '../lib/format';
import { Icon } from './Icon';
import { Text } from './Text';

type BoxFieldProps = {
  box: Form210Box;
  /** Shows the box label above the field (hidden in the schedule matrix). */
  showLabel?: boolean;
  isSelected?: boolean;
  /** Opens the box detail. Only entered boxes are interactive. */
  onOpen?: (box: Form210Box) => void;
  /** Formats the value as a count instead of pesos. */
  isCount?: boolean;
};

/** Box with the total amount to pay; the other final result (137) is the balance in favor. */
const AMOUNT_TO_PAY_BOX = 136;

/** Figma "Casilla 210" variants. The final result is mint in favor and coral to pay (ADR 0044). */
type Tone = 'entered' | 'calculated' | 'not-applicable' | 'in-favor' | 'to-pay';

const toneOf = (box: Form210Box): Tone => {
  if (box.kind !== 'highlighted') return box.kind;
  return box.number === AMOUNT_TO_PAY_BOX ? 'to-pay' : 'in-favor';
};

const FIELD: Record<Tone, string> = {
  entered: 'border border-line-strong bg-surface',
  calculated: 'border border-line-action bg-rail',
  'not-applicable': 'bg-subtle',
  'in-favor': 'border border-line-success bg-mint-soft',
  'to-pay': 'border border-line-error bg-coral-soft',
};

const NUMBER: Record<Tone, string> = {
  entered: 'bg-action-soft text-fg-action',
  calculated: 'bg-action text-fg-on-action',
  'not-applicable': 'border border-line bg-subtle text-fg-muted',
  'in-favor': 'bg-mint text-fg',
  'to-pay': 'bg-coral text-fg',
};

/** Figma "Casilla 210": a box of the form with its number, value and formula or note. */
export const BoxField = ({
  box,
  showLabel = true,
  isSelected = false,
  onOpen,
  isCount = false,
}: BoxFieldProps) => {
  const isInteractive = box.kind === 'entered' && onOpen !== undefined;
  const tone = toneOf(box);
  const value = isCount ? formatNumber(box.value) : formatCurrency(box.value);

  const content = (
    <>
      <Text
        as='span'
        variant='caption'
        className={cn(
          'flex h-7.5 shrink-0 items-center rounded-sm px-2 font-bold',
          isSelected ? 'bg-action text-fg-on-action' : NUMBER[tone],
        )}
      >
        {box.number}
      </Text>
      <Text
        as='span'
        variant='figure-m'
        nowrap
        className={cn(
          'min-w-0 flex-1 text-left',
          box.kind === 'calculated' && 'text-fg-action',
          box.kind === 'not-applicable' && 'text-fg-muted',
        )}
      >
        {value}
      </Text>
      {isInteractive && <Icon icon={LuChevronRight} size={16} className='text-fg-muted' />}
    </>
  );

  const fieldClassName = cn(
    'flex h-11 w-full items-center gap-2.5 rounded-md pr-3 pl-1.5',
    FIELD[tone],
    isSelected && 'border-2 border-line-action pr-[calc(0.75rem-1px)] pl-[calc(0.375rem-1px)]',
  );

  return (
    <div className='flex min-w-0 flex-col gap-1.5'>
      {showLabel && (
        <Text variant='caption' className='text-fg-secondary'>
          {box.label}
        </Text>
      )}
      {isInteractive ? (
        <button
          type='button'
          onClick={() => {
            onOpen(box);
          }}
          aria-label={`Casilla ${String(box.number)}, ${box.label}: ${value}. Ver detalle`}
          aria-pressed={isSelected}
          className={cn(
            fieldClassName,
            'cursor-pointer transition-colors hover:border-line-action focus-visible:ring-2 focus-visible:ring-line-action focus-visible:ring-offset-2 focus-visible:outline-none',
          )}
        >
          {content}
        </button>
      ) : (
        <div className={fieldClassName} aria-label={`Casilla ${String(box.number)}, ${box.label}: ${value}`}>
          {content}
        </div>
      )}
      {(box.formula ?? box.note) && (
        <Text variant='note' className='text-center text-fg-muted'>
          {box.note ?? box.formula}
        </Text>
      )}
    </div>
  );
};
