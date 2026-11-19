import { useLocation } from 'react-router';

import type { ProgressState } from '@/shared/ui';

import { useDeclaration } from '../declaration/declaration-context';
import { FLOW_STEPS, findStepByPath } from '../flow';
import type { FlowStep } from '../flow';

export type StepProgress = FlowStep & { state: ProgressState; index: number };

/**
 * Progress of every flow step: the step of the current route is `current`, steps confirmed with
 * their primary action are `done`, and the rest are `pending`.
 */
export const useFlowProgress = () => {
  const { pathname } = useLocation();
  const { state } = useDeclaration();
  const currentStep = findStepByPath(pathname);

  const steps: StepProgress[] = FLOW_STEPS.map((step, index) => {
    let progress: ProgressState = 'pending';
    if (step.id === currentStep?.id) progress = 'current';
    else if (state.completedSteps.includes(step.id)) progress = 'done';
    return { ...step, index, state: progress };
  });

  return { steps, currentStep: steps.find(step => step.id === currentStep?.id) };
};
