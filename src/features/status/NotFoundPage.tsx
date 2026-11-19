import { LuArrowRight, LuInfo } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import { useDeclaration } from '@/app/declaration/declaration-context';
import { findResumeStep } from '@/app/flow';
import { Button, Chip } from '@/shared/ui';

import { StatusPage } from './StatusPage';

/** Screen 11 · Página no encontrada (ADR 0022). */
export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { state } = useDeclaration();
  const resumeStep = findResumeStep(state.completedSteps);

  return (
    <StatusPage
      eyebrow={
        <Chip variant='box' icon={LuInfo}>
          Error 404
        </Chip>
      }
      title='No encontramos esta página'
      description='Puede que el enlace esté mal escrito o que la página ya no exista. Tus respuestas siguen guardadas en este navegador.'
      actions={
        <>
          <Button icon={LuArrowRight} onClick={() => void navigate(resumeStep.path)}>
            Seguir mi declaración
          </Button>
          <Button variant='ghost' onClick={() => void navigate('/')}>
            Ir al inicio
          </Button>
        </>
      }
    />
  );
};
