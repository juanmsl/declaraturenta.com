import type { ReactNode } from 'react';
import { cn } from 'polpo/helpers';

import { formatCurrency } from '../lib/format';
import { Text } from './Text';

/**
 * Figma "Fila de cálculo": one line of a calculation breakdown. Figures are right aligned.
 * - `add`: a value that adds up. `subtract`: a value that is subtracted (shown with −).
 * - `subtotal`: a partial result. `total`: the final result, with a large figure.
 */
export type CalcRowVariant = 'add' | 'subtract' | 'subtotal' | 'total';

type CalcRowProps = {
  label: ReactNode;
  /** Amount in pesos, or custom content. */
  value: number | ReactNode;
  variant?: CalcRowVariant;
  className?: string;
};

export const MINUS = '−';

export const CalcRow = ({ label, value, variant = 'add', className }: CalcRowProps) => {
  const isSummary = variant === 'subtotal' || variant === 'total';
  const formatted =
    typeof value === 'number'
      ? `${variant === 'subtract' ? `${MINUS} ` : ''}${formatCurrency(value)}`
      : value;

  return (
    <div
      className={cn(
        'flex items-center gap-4',
        variant === 'total' ? 'py-3.5' : 'py-2',
        isSummary && 'border-t border-line',
        className,
      )}
    >
      <Text
        variant={isSummary ? 'body-m-strong' : 'body-m'}
        className={cn('min-w-0 flex-1', variant === 'subtract' ? 'text-fg-secondary' : 'text-fg')}
      >
        {label}
      </Text>
      <Text
        variant={variant === 'total' ? 'figure-l' : 'figure-m'}
        className={cn('shrink-0 text-right', variant === 'subtract' ? 'text-fg-secondary' : 'text-fg')}
      >
        {formatted}
      </Text>
    </div>
  );
};
