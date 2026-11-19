import { Outlet } from 'react-router';

import { FLOW_STEPS } from '../flow';
import { SideRail } from './SideRail';
import { TopBar } from './TopBar';
import { useFlowProgress } from './useFlowProgress';

/** Desktop shell: side rail on the left, top bar and the current screen on the right. */
export const AppLayout = () => {
  const { steps, currentStep } = useFlowProgress();

  const location = currentStep
    ? `Paso ${currentStep.index + 1} de ${FLOW_STEPS.length} · ${currentStep.title}`
    : 'Inicio · Antes de empezar';

  return (
    <div className='flex min-h-dvh min-w-7xl bg-canvas'>
      <SideRail steps={steps} />
      <div className='flex min-w-0 flex-1 flex-col'>
        <TopBar location={location} steps={steps} />
        <main className='flex-1'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
