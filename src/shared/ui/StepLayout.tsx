import type { ReactNode } from 'react';
import { cn } from 'polpo/helpers';

type StepLayoutProps = {
  children: ReactNode;
  /** Right panel (380 px): help or the live estimate. */
  aside?: ReactNode;
  className?: string;
};

/** Body of a flow screen: one question at a time in the center and an optional right panel. */
export const StepLayout = ({ children, aside, className }: StepLayoutProps) => (
  <div className='flex flex-1 items-stretch'>
    <div className={cn('flex min-w-0 flex-1 flex-col gap-8 px-14 py-12', className)}>{children}</div>
    {aside && (
      <aside className='flex w-95 shrink-0 flex-col gap-5 border-l border-line bg-surface px-8 py-10'>
        {aside}
      </aside>
    )}
  </div>
);
