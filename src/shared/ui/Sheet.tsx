import type { ReactNode } from 'react';
import { LuX } from 'react-icons/lu';
import { AsideModal } from 'polpo/components';

import { Icon } from './Icon';
import { Text } from './Text';

type SheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** Accessible name when the title is not plain text. */
  label?: string;
};

/**
 * Figma «Hoja» (M04a–M04d): panel that rises from the bottom on phones and tablets, built on
 * Polpo AsideModal. Its height follows the content, up to 90 % of the screen.
 */
export const Sheet = ({ isOpen, onClose, title, children, label }: SheetProps) => (
  <AsideModal
    isOpen={isOpen}
    onClose={onClose}
    position='bottom'
    backdrop='opaque'
    backdropBackground='rgb(23 22 43 / 0.45)'
    noCloseButton
    className='sheet'
  >
    <div
      role='dialog'
      aria-modal='true'
      aria-label={label ?? (typeof title === 'string' ? title : undefined)}
      className='mx-auto flex max-h-[90dvh] w-full max-w-180 flex-col'
    >
      <span className='mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-ink-300' aria-hidden />
      <header className='flex items-center gap-4 px-5 pt-4 pb-2'>
        <Text variant='title-s' as='h2' className='min-w-0 flex-1'>
          {title}
        </Text>
        <button
          type='button'
          onClick={onClose}
          aria-label='Cerrar'
          className='flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg transition-colors hover:bg-subtle focus-visible:ring-2 focus-visible:ring-line-action focus-visible:outline-none'
        >
          <Icon icon={LuX} size={20} />
        </button>
      </header>
      <div className='flex flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6'>{children}</div>
    </div>
  </AsideModal>
);
