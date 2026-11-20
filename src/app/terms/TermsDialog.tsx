import { useState } from 'react';
import { Link } from 'react-router';
import { LuCheck } from 'react-icons/lu';
import { Checkbox } from 'polpo/components';

import { Dialog, Icon, Text } from '@/shared/ui';

import { PRIVACY_PATH, TERMS_PATH } from '../flow';
import { acceptTerms, hasAcceptedTerms } from './terms-acceptance';

const POINTS = [
  'No somos la DIAN ni tenemos relación con ella. Tú presentas tu declaración en su portal.',
  'No es asesoría tributaria. Revisa las cifras con tus certificados y, si tu caso es complejo, con un contador.',
  'Tus datos se quedan en este navegador. No los recibimos ni los guardamos en un servidor.',
];

const linkClass = 'text-fg-action underline underline-offset-2 hover:text-fg';

/**
 * Screen 16 · Aceptación de términos (Figma 94:9975): shown the first time the app is used in this
 * browser, and again when the terms change. It cannot be dismissed without accepting (ADR 0037).
 */
export const TermsDialog = () => {
  const [isOpen, setIsOpen] = useState(() => !hasAcceptedTerms());
  const [checked, setChecked] = useState(false);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => undefined}
      title='Antes de empezar'
      confirmLabel='Empezar'
      confirmDisabled={!checked}
      onConfirm={() => {
        acceptTerms();
        setIsOpen(false);
      }}
    >
      <div className='flex flex-col gap-4'>
        <Text variant='body-m' className='text-fg-secondary'>
          Declara tu renta te ayuda a preparar el borrador de tu Formulario 210. Ten en cuenta:
        </Text>
        <ul className='flex flex-col gap-2.5'>
          {POINTS.map(point => (
            <li key={point} className='flex items-start gap-2'>
              <Icon icon={LuCheck} size={16} className='mt-0.5 shrink-0 text-fg-success' />
              <Text variant='body-m' className='text-fg-secondary'>
                {point}
              </Text>
            </li>
          ))}
        </ul>
        <Checkbox
          name='accept-terms'
          value={checked}
          setValue={setChecked}
          label={
            <Text as='span' variant='body-m' className='text-fg'>
              Leí y acepto los{' '}
              <Link to={TERMS_PATH} target='_blank' className={linkClass}>
                Términos de uso
              </Link>{' '}
              y la{' '}
              <Link to={PRIVACY_PATH} target='_blank' className={linkClass}>
                Política de privacidad
              </Link>
              .
            </Text>
          }
        />
      </div>
    </Dialog>
  );
};
