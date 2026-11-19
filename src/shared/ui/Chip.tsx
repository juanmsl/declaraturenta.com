import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { LuCheck, LuCircleX, LuFileText, LuTriangleAlert } from 'react-icons/lu';
import { cn } from 'polpo/helpers';

import { Icon } from './Icon';
import { Text } from './Text';

/**
 * Figma "Chip": traceability mark.
 * - `box`: a 210 box, a calculated value or a value the user entered (violet).
 * - `exogenous`: the value comes from the DIAN exogenous report, or a check passed (mint).
 * - `cap`: a legal cap or threshold applies (sun).
 * - `review`: the value needs the user's review (coral).
 */
export type ChipVariant = 'box' | 'exogenous' | 'cap' | 'review';

const VARIANTS: Record<ChipVariant, { className: string; icon: IconType }> = {
  box: { className: 'bg-action-soft text-fg-action', icon: LuFileText },
  exogenous: { className: 'bg-mint-soft text-fg-success', icon: LuCheck },
  cap: { className: 'bg-sun-soft text-fg-warning', icon: LuTriangleAlert },
  review: { className: 'bg-coral-soft text-fg-error', icon: LuCircleX },
};

type ChipProps = {
  variant: ChipVariant;
  children: ReactNode;
  /** Replaces the variant's default icon. */
  icon?: IconType;
  className?: string;
};

export const Chip = ({ variant, children, icon, className }: ChipProps) => {
  const config = VARIANTS[variant];

  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full py-1 pr-2.5 pl-2',
        config.className,
        className,
      )}
    >
      <Icon icon={icon ?? config.icon} size={14} />
      <Text as='span' variant='caption' className='text-current'>
        {children}
      </Text>
    </span>
  );
};
