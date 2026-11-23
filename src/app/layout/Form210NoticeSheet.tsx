import { useState } from 'react';

import { Button, Sheet, Text } from '@/shared/ui';

import { FORM_210_PATH } from '../flow';

type Form210NoticeSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Figma M04d: on phones and tablets «Formulario 210» explains that the full form needs a computer
 * and offers to copy its link (ADR 0060).
 */
export const Form210NoticeSheet = ({ isOpen, onClose }: Form210NoticeSheetProps) => {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${FORM_210_PATH}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={() => {
        setCopied(false);
        onClose();
      }}
      title='El Formulario 210 se usa en un computador'
    >
      <Text variant='body-m' className='text-fg-secondary'>
        La vista del formulario completo, casilla por casilla, necesita una pantalla ancha. Para usarla en un
        computador, descarga tus datos con «Mis datos» y cárgalos allá. Aquí puedes seguir llenando por pasos.
      </Text>
      <div className='flex flex-col gap-3'>
        <Button type='button' className='w-full' onClick={onClose}>
          Seguir por pasos
        </Button>
        <Button type='button' variant='secondary' className='w-full' onClick={() => void copyLink()}>
          {copied ? 'Enlace copiado' : 'Copiar enlace para el computador'}
        </Button>
      </div>
    </Sheet>
  );
};
