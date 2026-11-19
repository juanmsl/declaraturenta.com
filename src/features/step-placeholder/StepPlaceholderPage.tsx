import { Link } from 'react-router';

import type { FlowStep } from '@/app/flow';
import { Text } from '@/shared/ui';

type StepPlaceholderPageProps = {
  step: FlowStep;
};

/** Temporary screen for flow steps that are designed in Figma but not built yet. */
export const StepPlaceholderPage = ({ step }: StepPlaceholderPageProps) => (
  <div className='flex flex-col gap-3.5 px-14 py-12'>
    <Text variant='display'>{step.title}</Text>
    <Text variant='body-l' className='max-w-170 text-fg-secondary'>
      Estamos construyendo esta sección.{' '}
      <Link to='/' className='font-semibold text-fg-action underline-offset-4 hover:underline'>
        Volver al inicio
      </Link>
    </Text>
  </div>
);
