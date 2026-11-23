import { useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { formatLongDate } from '@/shared/lib/format';
import { Dialog, Text } from '@/shared/ui';

import { HOME_PATH } from '../flow';
import { BackupError, downloadBackup, parseBackup } from '../declaration/backup';
import { useTaxYear } from '../declaration/tax-year-context';
import type { DeclarationState } from '../declaration/declaration-state';
import { useDeclaration } from '../declaration/declaration-context';

type Pending = { state: DeclarationState; createdAt: string };

const ERRORS = {
  'not-a-backup':
    'Ese archivo no es de Declara tu renta. Elige el .json que descargaste con «Descargar datos».',
  outdated: 'Ese archivo es de una versión anterior de la plataforma y ya no se puede cargar.',
  'other-year': 'Ese archivo es de otro año gravable.',
} as const;

export type MyData = {
  /** Downloads the declaration as a .json file. */
  download: () => void;
  /** Opens the file picker to load a .json file. */
  load: () => void;
  /** Asks before resetting the open year. */
  reset: () => void;
  /** Hidden file input and the confirmation dialogs; render it once next to the menu. */
  elements: ReactNode;
};

/**
 * «Mis datos» actions (ADR 0027, 0040, 0051): download the declaration, load a downloaded file or
 * reset the open year. Shared by the desktop menu and the phone and tablet menu (ADR 0060).
 */
export const useMyData = (): MyData => {
  const { state, dispatch } = useDeclaration();
  const inputRef = useRef<HTMLInputElement>(null);
  const { taxYear } = useTaxYear();
  const [pending, setPending] = useState<Pending | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const navigate = useNavigate();

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setPending(parseBackup(await file.text(), taxYear.year));
    } catch (caught) {
      if (caught instanceof BackupError && caught.reason === 'other-year' && caught.year !== null) {
        setError(
          `Ese archivo es del año gravable ${String(caught.year)}. Cambia el año en «Año gravable» y cárgalo de nuevo.`,
        );
      } else {
        setError(caught instanceof BackupError ? ERRORS[caught.reason] : ERRORS['not-a-backup']);
      }
    }
  };

  return {
    download: () => {
      downloadBackup(state);
    },
    load: () => {
      inputRef.current?.click();
    },
    reset: () => {
      setConfirmingReset(true);
    },
    elements: (
      <>
        <input
          ref={inputRef}
          type='file'
          accept='.json,application/json'
          className='sr-only'
          tabIndex={-1}
          onChange={event => void handleFile(event)}
        />

        <Dialog
          isOpen={pending !== null}
          onClose={() => {
            setPending(null);
          }}
          title='¿Reemplazar tus datos con los del archivo?'
          confirmLabel='Reemplazar'
          cancelLabel='Cancelar'
          onConfirm={() => {
            if (pending) dispatch({ type: 'restore', state: pending.state });
            setPending(null);
          }}
        >
          <Text variant='body-m' className='text-fg-secondary'>
            Lo que tienes ahora en este navegador se cambia por los datos del archivo
            {pending?.createdAt ? ` del ${formatLongDate(pending.createdAt.slice(0, 10))}` : ''}. Si quieres
            conservarlo, descarga primero tus datos.
          </Text>
        </Dialog>

        <Dialog
          isOpen={confirmingReset}
          onClose={() => {
            setConfirmingReset(false);
          }}
          title='¿Reiniciar el formulario?'
          confirmLabel='Reiniciar formulario'
          cancelLabel='Cancelar'
          onConfirm={() => {
            dispatch({ type: 'reset' });
            setConfirmingReset(false);
            void navigate(HOME_PATH);
          }}
        >
          <Text variant='body-m' className='text-fg-secondary'>
            Se borra tu declaración del año gravable {String(taxYear.year)} guardada en este navegador y
            vuelves a empezar desde cero. Si quieres conservarla, descarga tus datos antes. No se puede
            deshacer.
          </Text>
        </Dialog>

        <Dialog
          isOpen={error !== null}
          onClose={() => {
            setError(null);
          }}
          title='No pudimos cargar ese archivo'
          confirmLabel='Entendido'
          onConfirm={() => {
            setError(null);
          }}
        >
          <Text variant='body-m' className='text-fg-secondary'>
            {error}
          </Text>
        </Dialog>
      </>
    ),
  };
};
