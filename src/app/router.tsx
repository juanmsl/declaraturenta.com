import { createBrowserRouter } from 'react-router';

import { HomePage } from '@/features/home/HomePage';
import { StepPlaceholderPage } from '@/features/step-placeholder/StepPlaceholderPage';

import { FLOW_STEPS } from './flow';
import { AppLayout } from './layout/AppLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      // Screens not built yet render a placeholder so navigation works end to end.
      ...FLOW_STEPS.map(step => ({ path: step.path.slice(1), element: <StepPlaceholderPage step={step} /> })),
    ],
  },
]);
