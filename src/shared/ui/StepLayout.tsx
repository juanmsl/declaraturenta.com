import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from 'polpo/helpers';

import { useIsCompact } from '@/shared/lib/use-compact';

import { StepLayoutContext, useStepLayout } from './step-layout-context';

/** The side panel as a card in the one-column layout; empty when the panel shows elsewhere. */
const CompactAside = ({ children }: { children: ReactNode }) => (
  <div className='flex flex-col gap-5 rounded-lg border border-line bg-surface p-5 empty:hidden'>
    {children}
  </div>
);

type StepLayoutProps = {
  children: ReactNode;
  /** Right panel (380 px): help or the live estimate. */
  aside?: ReactNode;
  /** Spacing of the desktop column; phones and tablets use their own (ADR 0060). */
  className?: string;
};

/**
 * Body of a flow screen: one question at a time in the center and an optional right panel. On
 * phones and tablets it is one column and the panel goes before the step actions (ADR 0060).
 */
export const StepLayout = ({ children, aside, className }: StepLayoutProps) => {
  const isCompact = useIsCompact();
  const [hasActions, setHasActions] = useState(false);
  const [barSlot, setBarSlot] = useState<HTMLDivElement | null>(null);
  const registerActions = useCallback(() => {
    setHasActions(true);
  }, []);
  const context = useMemo(
    () => ({ compact: isCompact, aside, barSlot, registerActions }),
    [isCompact, aside, barSlot, registerActions],
  );

  if (isCompact) {
    return (
      <StepLayoutContext value={context}>
        <div className='flex flex-1 flex-col'>
          <div className='mx-auto flex w-full max-w-180 min-w-0 flex-1 flex-col gap-6 px-4 pt-4 pb-8 md:px-8 md:pt-8'>
            {children}
            {!hasActions && aside && <CompactAside>{aside}</CompactAside>}
          </div>
          <div ref={setBarSlot} className='sticky bottom-0 z-20' />
        </div>
      </StepLayoutContext>
    );
  }

  return (
    <StepLayoutContext value={context}>
      <div className='flex flex-1 items-stretch'>
        <div className={cn('flex min-w-0 flex-1 flex-col gap-8 px-14 py-12', className)}>{children}</div>
        {aside && (
          <aside className='flex w-95 shrink-0 flex-col gap-5 border-l border-line bg-surface px-8 py-10'>
            {aside}
          </aside>
        )}
      </div>
    </StepLayoutContext>
  );
};

type StepActionsProps = {
  children: ReactNode;
  className?: string;
};

/**
 * «Atrás» and the main action at the end of a step: apart on a computer; on phones and tablets the
 * main action fills the width, «Atrás» goes centered below it and the side panel comes first
 * (Figma M03–M15). Put «Atrás» first and the main action last.
 */
export const StepActions = ({ children, className }: StepActionsProps) => {
  const layout = useStepLayout();
  const isCompact = useIsCompact();
  const registerActions = layout?.registerActions;

  useLayoutEffect(() => {
    registerActions?.();
  }, [registerActions]);

  if (isCompact) {
    return (
      <>
        {layout?.aside && <CompactAside>{layout.aside}</CompactAside>}
        <div className={cn('flex flex-col-reverse items-center gap-3 [&>*:last-child]:w-full', className)}>
          {children}
        </div>
      </>
    );
  }

  return <div className={cn('flex items-start justify-between', className)}>{children}</div>;
};
