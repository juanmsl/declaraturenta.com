import type { ReactNode } from 'react';
import { LuX } from 'react-icons/lu';
import { AsideModal } from 'polpo/components';

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

/** Right side panel (Figma screen 09b), built on Polpo AsideModal. */
export const Drawer = ({ isOpen, onClose, title, subtitle, eyebrow, children, footer }: DrawerProps) => (
  <AsideModal
    isOpen={isOpen}
    onClose={onClose}
    position='right'
    size='560px'
    backdrop='opaque'
    backdropBackground='rgb(23 22 43 / 0.45)'
    noCloseButton
    className='drawer'
  >
    <div role='dialog' aria-modal='true' className='flex h-full flex-col'>
      <header className='flex items-start gap-4 px-8 pt-7'>
        <div className='flex min-w-0 flex-1 flex-col gap-2'>
          {eyebrow}
          <Text variant='title-l' as='h2'>
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
          className='flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-subtle text-fg transition-colors hover:bg-ink-150 focus-visible:ring-2 focus-visible:ring-line-action focus-visible:outline-none'
        >
          <Icon icon={LuX} size={18} />
        </button>
      </header>
      <div className='flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6'>{children}</div>
      {footer && (
        <footer className='flex items-center justify-between border-t border-line px-8 py-5'>{footer}</footer>
      )}
    </div>
  </AsideModal>
);
