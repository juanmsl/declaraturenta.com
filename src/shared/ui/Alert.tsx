import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { LuCircleCheck, LuCircleX, LuInfo, LuTriangleAlert } from 'react-icons/lu';
import { cn } from 'polpo/helpers';

import { Icon } from './Icon';
import { Text } from './Text';

/** Figma "Alerta". Color never goes alone: there is always an icon and text. */
export type AlertVariant = 'info' | 'warning' | 'error' | 'success';

const VARIANTS: Record<AlertVariant, { container: string; title: string; icon: IconType }> = {
  info: { container: 'bg-action-soft', title: 'text-fg-action', icon: LuInfo },
  warning: { container: 'bg-sun-soft', title: 'text-fg-warning', icon: LuTriangleAlert },
  error: { container: 'bg-coral-soft', title: 'text-fg-error', icon: LuCircleX },
  success: { container: 'bg-mint-soft', title: 'text-fg-success', icon: LuCircleCheck },
};

type AlertProps = {
  variant: AlertVariant;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
};

export const Alert = ({ variant, title, children, className }: AlertProps) => {
  const config = VARIANTS[variant];

  return (
    <div className={cn('flex items-start gap-3 rounded-md p-4', config.container, className)}>
      <Icon icon={config.icon} size={20} className={cn('mt-px', config.title)} />
      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <Text variant='body-m-strong' className={config.title}>
          {title}
        </Text>
        {children && (
          <Text variant='body-m' className='text-fg-secondary'>
            {children}
          </Text>
        )}
      </div>
    </div>
  );
};
