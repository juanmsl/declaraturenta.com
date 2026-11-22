import { createBrowserRouter } from 'react-router';

import { AssetsPage } from '@/features/assets/AssetsPage';
import { DeductionsPage } from '@/features/deductions/DeductionsPage';
import { DraftPage } from '@/features/draft/DraftPage';
import { Form210Page } from '@/features/form-210/Form210Page';
import { ExogenousPage } from '@/features/exogenous/ExogenousPage';
import { HomePage } from '@/features/home/HomePage';
import { IncomePage } from '@/features/income/IncomePage';
import { LandingPage } from '@/features/landing/LandingPage';
import { LegalPage } from '@/features/legal/LegalPage';
import { AdjustmentsPage } from '@/features/adjustments/AdjustmentsPage';
import { ResultPage } from '@/features/result/ResultPage';
import { ErrorPage } from '@/features/status/ErrorPage';
import { NotFoundPage } from '@/features/status/NotFoundPage';

import { FORM_210_PATH, LANDING_PATH, PRIVACY_PATH, TERMS_PATH } from './flow';
import { HelpProvider } from './help/HelpProvider';
import { AppLayout } from './layout/AppLayout';
import { RootLayout } from './layout/RootLayout';
import { DesktopOnly } from './layout/DesktopOnly';

export const router = createBrowserRouter([
  {
    // Scroll restoration and page transitions for every route (ADR 0043).
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      // The landing page works on any screen (ADR 0036).
      { path: LANDING_PATH, element: <LandingPage />, errorElement: <ErrorPage /> },
      { path: TERMS_PATH, element: <LegalPage page='terms' />, errorElement: <ErrorPage /> },
      { path: PRIVACY_PATH, element: <LegalPage page='privacy' />, errorElement: <ErrorPage /> },
      {
        // Phones and tablets get the compact layout (ADR 0060).
        element: <AppLayout />,
        errorElement: <ErrorPage />,
        children: [
          { path: 'inicio', element: <HomePage /> },
          { path: 'exogena', element: <ExogenousPage /> },
          { path: 'ingresos', element: <IncomePage /> },
          { path: 'patrimonio', element: <AssetsPage /> },
          { path: 'deducciones', element: <DeductionsPage /> },
          { path: 'otros-ajustes', element: <AdjustmentsPage /> },
          { path: 'resultado', element: <ResultPage /> },
          { path: 'borrador-210', element: <DraftPage /> },
        ],
      },
      // Screen 09 has its own layout (no side rail) and still needs a computer (ADR 0060).
      {
        path: FORM_210_PATH,
        element: (
          <DesktopOnly>
            <HelpProvider>
              <Form210Page />
            </HelpProvider>
          </DesktopOnly>
        ),
        errorElement: <ErrorPage />,
      },
      // Screens 11 and 12 (ADR 0022): unknown paths and unexpected errors.
      { path: '*', element: <NotFoundPage />, errorElement: <ErrorPage /> },
    ],
  },
]);
