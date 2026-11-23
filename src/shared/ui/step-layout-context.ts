import { createContext, use } from 'react';
import type { ReactNode } from 'react';

export type StepLayoutContextValue = {
  /** Phone and tablet layout (ADR 0060). */
  compact: boolean;
  /** The step's side panel; on phones and tablets it goes right before the step actions. */
  aside: ReactNode;
  /** Element at the bottom of the step where the summary bar sticks. */
  barSlot: HTMLElement | null;
  /** Called by `StepActions`, which then shows the side panel before itself. */
  registerActions: () => void;
};

export const StepLayoutContext = createContext<StepLayoutContextValue | null>(null);

/** Layout of the current flow step, or null outside a `StepLayout`. */
export const useStepLayout = (): StepLayoutContextValue | null => use(StepLayoutContext);
