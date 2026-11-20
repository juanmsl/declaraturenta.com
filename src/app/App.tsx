import { RouterProvider } from 'react-router/dom';

import { DeclarationProvider } from './declaration/DeclarationProvider';
import { router } from './router';

export const App = () => (
  <DeclarationProvider>
    <RouterProvider router={router} />
  </DeclarationProvider>
);
