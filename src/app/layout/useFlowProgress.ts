import { useLocation } from 'react-router';

import type { ProgressState } from '@/shared/ui';

import { FLOW_STEPS, findStepByPath } from '../flow';
import type { FlowStep } from '../flow';

export type StepProgress = FlowStep & { state: ProgressState; index: number };

/**
 * Progress of every flow step for the current route.
 * There is no persisted progress yet (see docs/context.md): the step of the current
 * route is `current` and every other step is `pending`.
 */
export const useFlowProgress = () => {
  const { pathname } = useLocation();
  const currentStep = findStepByPath(pathname);

  const steps: StepProgress[] = FLOW_STEPS.map((step, index) => ({
    ...step,
    index,
    state: step.id === currentStep?.id ? 'current' : 'pending',
  }));

  return { steps, currentStep: steps.find(step => step.id === currentStep?.id) };
};
