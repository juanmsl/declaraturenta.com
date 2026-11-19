import { createBrowserRouter } from 'react-router';

import { HomePage } from '@/features/home/HomePage';
import { ShouldFilePage } from '@/features/should-file/ShouldFilePage';
import { StepPlaceholderPage } from '@/features/step-placeholder/StepPlaceholderPage';

import { FLOW_STEPS } from './flow';
import type { FlowStepId } from './flow';
import { AppLayout } from './layout/AppLayout';

const BUILT_STEPS = new Set<FlowStepId>(['should-file']);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'debo-declarar', element: <ShouldFilePage /> },
      // Screens not built yet render a placeholder so navigation works end to end.
      ...FLOW_STEPS.filter(step => !BUILT_STEPS.has(step.id)).map(step => ({
        path: step.path.slice(1),
        element: <StepPlaceholderPage step={step} />,
      })),
    ],
  },
]);
