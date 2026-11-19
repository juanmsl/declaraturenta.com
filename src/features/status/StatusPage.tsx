import type { ReactNode } from 'react';

import { Logo, Text } from '@/shared/ui';

type StatusPageProps = {
  /** Chip above the title (error code or type). */
  eyebrow: ReactNode;
  title: string;
  description: string;
  actions: ReactNode;
  note?: string;
  /** Shown under the note (e.g. download a copy of the data). */
  extraAction?: ReactNode;
};

/** Layout of the 404 and error pages (Figma screens 11 and 12): top bar with the logo, centered message. */
export const StatusPage = ({ eyebrow, title, description, actions, note, extraAction }: StatusPageProps) => (
  <div className='flex min-h-dvh min-w-7xl flex-col bg-canvas'>
    <header className='flex h-18 shrink-0 items-center border-b border-line bg-surface px-30'>
      <a
        href='/'
        className='rounded-sm focus-visible:ring-2 focus-visible:ring-line-action focus-visible:outline-none'
      >
        <Logo size={28} wordmarkVariant='title-s' decorative />
      </a>
    </header>
    <main className='flex flex-1 items-center justify-center px-6 py-16'>
      <div className='flex w-140 flex-col gap-6'>
        {eyebrow}
        <div className='flex flex-col gap-3'>
          <Text variant='display' as='h1'>
            {title}
          </Text>
          <Text variant='body-l' className='text-fg-secondary'>
            {description}
          </Text>
        </div>
        <div className='flex items-center gap-3'>{actions}</div>
        {note && (
          <Text variant='note' className='text-fg-muted'>
            {note}
          </Text>
        )}
        {extraAction && <div>{extraAction}</div>}
      </div>
    </main>
  </div>
);
