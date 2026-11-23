import type { ReactNode } from 'react';
import { LuX } from 'react-icons/lu';
import { AsideModal } from 'polpo/components';
import { cn } from 'polpo/helpers';

import { useIsCompact } from '@/shared/lib/use-compact';

import { Icon } from './Icon';
import { Text } from './Text';

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Small line under the title. */
  subtitle?: ReactNode;
  /** Shown above the title, e.g. a box chip. */
  eyebrow?: ReactNode;
  children: ReactNode;
  /** Sticky actions at the bottom. */
  footer?: ReactNode;
};

/**
 * Side panel (Figma screen 09b), built on Polpo AsideModal. On phones and tablets it rises from
 * the bottom, 90 % of the screen tall, with the actions stuck at the bottom (Figma M09b, ADR 0061).
 */
export const Drawer = ({ isOpen, onClose, title, subtitle, eyebrow, children, footer }: DrawerProps) => {
  const isCompact = useIsCompact();

  return (
    <AsideModal
      isOpen={isOpen}
      onClose={onClose}
      position={isCompact ? 'bottom' : 'right'}
      size={isCompact ? undefined : '560px'}
      backdrop='opaque'
      backdropBackground='rgb(23 22 43 / 0.45)'
      noCloseButton
      className={isCompact ? 'drawer drawer-sheet' : 'drawer'}
    >
      <div
        role='dialog'
        aria-modal='true'
        className={cn('flex h-full flex-col', isCompact && 'mx-auto max-w-180')}
      >
        {isCompact && <span className='mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-ink-300' aria-hidden />}
        <header className={cn('flex items-start gap-4', isCompact ? 'px-5 pt-4' : 'px-8 pt-7')}>
          <div className='flex min-w-0 flex-1 flex-col gap-2'>
            {eyebrow}
            <Text variant={isCompact ? 'title-m' : 'title-l'} as='h2'>
              {title}
            </Text>
            {subtitle && (
              <Text variant='note' className='text-fg-muted'>
                {subtitle}
              </Text>
            )}
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Cerrar'
            className={cn(
              'flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg transition-colors focus-visible:ring-2 focus-visible:ring-line-action focus-visible:outline-none',
              isCompact ? 'hover:bg-subtle' : 'bg-subtle hover:bg-ink-150',
            )}
          >
            <Icon icon={LuX} size={18} />
          </button>
        </header>
        <div
          className={cn('flex flex-1 flex-col gap-5 overflow-y-auto', isCompact ? 'px-5 py-5' : 'px-8 py-6')}
        >
          {children}
        </div>
        {footer && (
          <footer
            className={cn(
              'flex items-center justify-between border-t border-line',
              isCompact ? 'flex-col-reverse items-stretch gap-2 px-5 pt-3 pb-5 [&>*]:w-full' : 'px-8 py-5',
            )}
          >
            {footer}
          </footer>
        )}
      </div>
    </AsideModal>
  );
};
