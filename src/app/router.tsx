import { createBrowserRouter } from 'react-router';

import { AssetsPage } from '@/features/assets/AssetsPage';
import { DeductionsPage } from '@/features/deductions/DeductionsPage';
import { DraftPage } from '@/features/draft/DraftPage';
import { Form210Page } from '@/features/form-210/Form210Page';
import { ExogenousPage } from '@/features/exogenous/ExogenousPage';
import { HomePage } from '@/features/home/HomePage';
import { IncomePage } from '@/features/income/IncomePage';
import { ResultPage } from '@/features/result/ResultPage';
import { ShouldFilePage } from '@/features/should-file/ShouldFilePage';
import { ErrorPage } from '@/features/status/ErrorPage';
import { NotFoundPage } from '@/features/status/NotFoundPage';

import { FORM_210_PATH } from './flow';
import { AppLayout } from './layout/AppLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'debo-declarar', element: <ShouldFilePage /> },
      { path: 'exogena', element: <ExogenousPage /> },
      { path: 'ingresos', element: <IncomePage /> },
      { path: 'patrimonio', element: <AssetsPage /> },
      { path: 'deducciones', element: <DeductionsPage /> },
      { path: 'resultado', element: <ResultPage /> },
      { path: 'borrador-210', element: <DraftPage /> },
    ],
  },
  // Screen 09 has its own layout (no side rail).
  { path: FORM_210_PATH, element: <Form210Page />, errorElement: <ErrorPage /> },
  // Screens 11 and 12 (ADR 0022): unknown paths and unexpected errors.
  { path: '*', element: <NotFoundPage />, errorElement: <ErrorPage /> },
]);
