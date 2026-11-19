import { createBrowserRouter } from 'react-router';

import { ExogenousPage } from '@/features/exogenous/ExogenousPage';
import { HomePage } from '@/features/home/HomePage';
import { IncomePage } from '@/features/income/IncomePage';
import { ShouldFilePage } from '@/features/should-file/ShouldFilePage';
import { StepPlaceholderPage } from '@/features/step-placeholder/StepPlaceholderPage';

import { FLOW_STEPS } from './flow';
import type { FlowStepId } from './flow';
import { AppLayout } from './layout/AppLayout';

const BUILT_STEPS = new Set<FlowStepId>(['should-file', 'exogenous', 'income']);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'debo-declarar', element: <ShouldFilePage /> },
      { path: 'exogena', element: <ExogenousPage /> },
      { path: 'ingresos', element: <IncomePage /> },
      // Screens not built yet render a placeholder so navigation works end to end.
      ...FLOW_STEPS.filter(step => !BUILT_STEPS.has(step.id)).map(step => ({
        path: step.path.slice(1),
        element: <StepPlaceholderPage step={step} />,
      })),
    ],
  },
]);
