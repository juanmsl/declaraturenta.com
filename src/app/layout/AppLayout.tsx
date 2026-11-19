import { useEffect } from 'react';
import { Outlet } from 'react-router';

import { useDeclaration } from '../declaration/declaration-context';
import { HelpProvider } from '../help/HelpProvider';

import { FLOW_STEPS } from '../flow';
import { SideRail } from './SideRail';
import { TopBar } from './TopBar';
import { useFlowProgress } from './useFlowProgress';

/** Desktop shell: side rail on the left, top bar and the current screen on the right. */
export const AppLayout = () => {
  const { steps, currentStep } = useFlowProgress();
  const { dispatch } = useDeclaration();
  const currentStepId = currentStep?.id;

  useEffect(() => {
    if (currentStepId) dispatch({ type: 'visitStep', step: currentStepId });
  }, [currentStepId, dispatch]);

  const location = currentStep
    ? `Paso ${currentStep.index + 1} de ${FLOW_STEPS.length} · ${currentStep.title}`
    : 'Inicio · Antes de empezar';

  return (
    <HelpProvider>
      <div className='flex min-h-dvh min-w-7xl bg-canvas'>
        <SideRail steps={steps} />
        <div className='flex min-w-0 flex-1 flex-col'>
          <TopBar location={location} steps={steps} />
          <main className='flex flex-1 flex-col'>
            <Outlet />
          </main>
        </div>
      </div>
    </HelpProvider>
  );
};
