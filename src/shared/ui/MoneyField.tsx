import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { IconBaseProps, IconType } from 'react-icons';
import { LuCircleX } from 'react-icons/lu';
import { InputNumber } from 'polpo/components';
import { cn } from 'polpo/helpers';

import { LOCALE } from '../lib/format';
import { Chip } from './Chip';
import type { ChipVariant } from './Chip';
import { Icon } from './Icon';
import { Text } from './Text';

const PESO_FORMAT = { locales: LOCALE, style: 'decimal', maximumFractionDigits: 0 } as const;

const PesoSign: IconType = ({ className }: IconBaseProps) => (
  <span className={cn('type-body-m-strong text-fg-muted', className)}>$</span>
);

type MoneyFieldProps = {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Help text under the field. */
  hint?: ReactNode;
  /** Error text; replaces the hint and marks the field. */
  error?: string;
  /** Origin chip shown inside the field, e.g. "Desde exógena". */
  origin?: { variant: ChipVariant; label: string };
  disabled?: boolean;
  /** `compact`: 13 px label and 44 px box (Figma screen 09). */
  size?: 'regular' | 'compact';
  /** False for counts (no `$` sign). */
  currency?: boolean;
};

/**
 * Amount in pesos with tabular figures (Figma "Campo monetario": empty, prefilled, focus, error).
 * Built on Polpo InputNumber; Figma styles live in src/styles/polpo-overrides.css.
 */
export const MoneyField = ({
  name,
  label,
  value,
  onChange,
  hint,
  error,
  origin,
  disabled,
  size = 'regular',
  currency = true,
}: MoneyFieldProps) => {
  const originVariant = origin?.variant;
  const originLabel = origin?.label;
  // Polpo's Field renders `rightIcon` as a component, so the chip is wrapped in one.
  const OriginChip = useMemo<IconType | undefined>(() => {
    if (!originVariant || !originLabel) return undefined;
    const OriginChipIcon = ({ className }: IconBaseProps) => (
      <Chip variant={originVariant} className={className}>
        {originLabel}
      </Chip>
    );
    return OriginChipIcon;
  }, [originVariant, originLabel]);

  return (
    <div
      className={cn(
        'money-field flex flex-col gap-2',
        value === 0 && 'is-empty',
        error && 'has-error',
        size === 'compact' && 'is-compact',
      )}
    >
      <InputNumber
        name={name}
        label={label}
        value={value}
        setValue={next => {
          onChange(Math.max(0, Math.round(next)));
        }}
        format={PESO_FORMAT}
        decimalSeparator=','
        leftIcon={currency ? PesoSign : undefined}
        rightIcon={OriginChip}
        disabled={disabled}
      />
      {error ? (
        <div className='flex items-center gap-1.5 text-fg-error' role='alert'>
          <Icon icon={LuCircleX} size={16} />
          <Text variant='note' className='text-fg-error'>
            {error}
          </Text>
        </div>
      ) : (
        hint && (
          <Text variant='note' className='text-fg-muted'>
            {hint}
          </Text>
        )
      )}
    </div>
  );
};
