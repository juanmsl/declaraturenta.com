import { useEffect } from 'react';
import { Outlet } from 'react-router';

import { useDeclaration } from '../declaration/declaration-context';
import { HelpProvider } from '../help/HelpProvider';
import { useAppPageMeta } from '../seo/use-page-meta';
import { TermsDialog } from '../terms/TermsDialog';

import { useIsCompact } from '@/shared/lib/use-compact';

import { MobileTopBar } from './MobileTopBar';
import { PageTransition } from './PageTransition';
import { SideRail } from './SideRail';
import { TopBar } from './TopBar';
import { ViewSwitcher } from './ViewSwitcher';
import { useFlowProgress } from './useFlowProgress';

/**
 * App shell. Computer: side rail on the left, top bar and the current screen on the right. Phone
 * and tablet: top bar with the steps and the menu in sheets, the view switcher and the screen in
 * one column (ADR 0060).
 */
export const AppLayout = () => {
  const { steps, currentStep } = useFlowProgress();
  const isCompact = useIsCompact();
  const { dispatch } = useDeclaration();
  const currentStepId = currentStep?.id;

  useEffect(() => {
    if (currentStepId) dispatch({ type: 'visitStep', step: currentStepId });
  }, [currentStepId, dispatch]);

  useAppPageMeta(currentStep?.title ?? 'Inicio');

  if (isCompact) {
    return (
      <HelpProvider>
        <div className='flex min-h-dvh flex-col overflow-x-clip bg-canvas'>
          <MobileTopBar steps={steps} currentStep={currentStep} />
          <div className='mx-auto w-full max-w-180 px-4 pt-1.5 md:px-8 md:pt-3'>
            <ViewSwitcher view='steps' />
          </div>
          <main className='flex flex-1 flex-col'>
            <PageTransition steps className='flex flex-1 flex-col'>
              <Outlet />
            </PageTransition>
          </main>
        </div>
        <TermsDialog />
      </HelpProvider>
    );
  }

  return (
    <HelpProvider>
      <div className='flex min-h-dvh min-w-7xl bg-canvas'>
        <SideRail steps={steps} />
        <div className='flex min-w-0 flex-1 flex-col'>
          <TopBar />
          <main className='flex flex-1 flex-col'>
            <PageTransition steps className='flex flex-1 flex-col'>
              <Outlet />
            </PageTransition>
          </main>
        </div>
      </div>
      <TermsDialog />
    </HelpProvider>
  );
};
