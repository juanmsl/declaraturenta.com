import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { LuChevronDown, LuDownload, LuTrash2, LuUpload } from 'react-icons/lu';
import { Menu } from 'polpo/components';
import { useModal } from 'polpo/hooks';
import { useNavigate } from 'react-router';

import { formatLongDate } from '@/shared/lib/format';
import { Button, Dialog, Text } from '@/shared/ui';

import { HOME_PATH } from '../flow';
import { BackupError, downloadBackup, parseBackup } from '../declaration/backup';
import { useTaxYear } from '../declaration/tax-year-context';
import type { DeclarationState } from '../declaration/declaration-state';
import { useDeclaration } from '../declaration/declaration-context';

type Pending = { state: DeclarationState; createdAt: string };

const ERRORS = {
  'not-a-backup':
    'Ese archivo no es una copia de Declara tu renta. Elige el .json que descargaste con «Descargar copia».',
  outdated: 'Esa copia es de una versión anterior de la plataforma y ya no se puede abrir.',
  'other-year': 'Esa copia es de otro año gravable.',
} as const;

/**
 * "Copia" in the top bar: download the declaration as a .json file, open one (ADR 0027) or delete
 * the open year from this browser (ADR 0040).
 */
export const CopyMenu = () => {
  const { state, dispatch } = useDeclaration();
  const { containerRef, isOpen, openModal, closeModal } = useModal<HTMLButtonElement>();
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
          `Esa copia es del año gravable ${String(caught.year)}. Cambia el año en «Año gravable» y ábrela de nuevo.`,
        );
      } else {
        setError(caught instanceof BackupError ? ERRORS[caught.reason] : ERRORS['not-a-backup']);
      }
    }
  };

  return (
    <>
      <Button
        ref={containerRef}
        variant='ghost'
        type='button'
        icon={LuChevronDown}
        onClick={openModal}
        className='shrink-0'
      >
        Copia
      </Button>
      <Menu
        id='copy-menu'
        isOpen={isOpen}
        onClose={closeModal}
        containerRef={containerRef}
        position='bottom right'
        backdrop='transparent'
      >
        <Menu.Option
          icon={LuDownload}
          label='Descargar copia'
          onClick={() => {
            downloadBackup(state);
            closeModal();
          }}
        />
        <Menu.Option
          icon={LuUpload}
          label='Abrir copia'
          onClick={() => {
            closeModal();
            inputRef.current?.click();
          }}
        />
        <Menu.Divider />
        <Menu.Option
          icon={LuTrash2}
          label='Borrar mis datos'
          className='text-fg-error'
          onClick={() => {
            closeModal();
            setConfirmingReset(true);
          }}
        />
      </Menu>
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
        title='¿Reemplazar tus datos con la copia?'
        confirmLabel='Reemplazar'
        cancelLabel='Cancelar'
        onConfirm={() => {
          if (pending) dispatch({ type: 'restore', state: pending.state });
          setPending(null);
        }}
      >
        <Text variant='body-m' className='text-fg-secondary'>
          Lo que tienes ahora en este navegador se cambia por la copia
          {pending?.createdAt ? ` del ${formatLongDate(pending.createdAt.slice(0, 10))}` : ''}. Si quieres
          conservarlo, descarga primero una copia.
        </Text>
      </Dialog>

      <Dialog
        isOpen={confirmingReset}
        onClose={() => {
          setConfirmingReset(false);
        }}
        title='¿Borrar tus datos de este navegador?'
        confirmLabel='Borrar mis datos'
        cancelLabel='Cancelar'
        onConfirm={() => {
          dispatch({ type: 'reset' });
          setConfirmingReset(false);
          void navigate(HOME_PATH);
        }}
      >
        <Text variant='body-m' className='text-fg-secondary'>
          Se borra tu declaración del año gravable {String(taxYear.year)} guardada aquí y vuelves a empezar
          desde cero. Si quieres conservarla, descarga una copia antes. No se puede deshacer.
        </Text>
      </Dialog>

      <Dialog
        isOpen={error !== null}
        onClose={() => {
          setError(null);
        }}
        title='No pudimos abrir esa copia'
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
  );
};
