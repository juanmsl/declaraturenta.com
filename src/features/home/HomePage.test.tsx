import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { DeclarationProvider } from '@/app/declaration/DeclarationProvider';
import { createInitialState } from '@/app/declaration/declaration-state';
import { HelpProvider } from '@/app/help/HelpProvider';

import { HomePage } from './HomePage';

const renderHome = () => {
  const router = createMemoryRouter([
    {
      path: '/',
      element: (
        <HelpProvider>
          <HomePage />
        </HelpProvider>
      ),
    },
    { path: '/debo-declarar', element: <p>Debo declarar</p> },
    { path: '/exogena', element: <p>Exógena</p> },
  ]);
  render(
    <DeclarationProvider initialState={createInitialState()}>
      <RouterProvider router={router} />
    </DeclarationProvider>,
  );
  return router;
};

describe('HomePage', () => {
  it('greets the taxpayer and lists the seven sections', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Hola, Laura. Preparemos tu declaración de renta del año gravable 2025.',
    );
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(7);
    expect(screen.getByText('15 de septiembre de 2026')).toBeInTheDocument();
  });

  it('starts the flow from the primary action', async () => {
    const router = renderHome();
    await userEvent.click(screen.getByRole('button', { name: /Empezar por ¿Debo declarar\?/u }));
    expect(router.state.location.pathname).toBe('/debo-declarar');
  });
});
