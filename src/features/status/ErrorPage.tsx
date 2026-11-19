import { LuArrowRight, LuCircleAlert } from 'react-icons/lu';
import { isRouteErrorResponse, useRouteError } from 'react-router';

import { downloadBackup } from '@/app/declaration/backup';
import { useDeclaration } from '@/app/declaration/declaration-context';
import { Button, Chip } from '@/shared/ui';

import { NotFoundPage } from './NotFoundPage';
import { StatusPage } from './StatusPage';

/**
 * Screen 12 · Error inesperado, used as the router's error element (ADR 0022). A 404 response
 * from the router shows screen 11 instead.
 */
export const ErrorPage = () => {
  const error = useRouteError();
  const { state } = useDeclaration();

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  return (
    <StatusPage
      eyebrow={
        <Chip variant='review' icon={LuCircleAlert}>
          Error inesperado
        </Chip>
      }
      title='Algo no salió como esperábamos'
      description='Tuvimos un problema al mostrar esta pantalla. Tus respuestas siguen guardadas en este navegador; intenta de nuevo.'
      actions={
        <>
          <Button
            icon={LuArrowRight}
            onClick={() => {
              window.location.reload();
            }}
          >
            Intentar de nuevo
          </Button>
          <Button
            variant='ghost'
            onClick={() => {
              window.location.assign('/');
            }}
          >
            Ir al inicio
          </Button>
        </>
      }
      note='Si el problema sigue, descarga una copia de tus datos antes de cerrar.'
      extraAction={
        <Button
          variant='secondary'
          onClick={() => {
            downloadBackup(state);
          }}
        >
          Descargar copia de mis datos
        </Button>
      }
    />
  );
};
