import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { LuChevronDown, LuDownload, LuUpload } from 'react-icons/lu';
import { Menu } from 'polpo/components';
import { useModal } from 'polpo/hooks';

import { formatLongDate } from '@/shared/lib/format';
import { Button, Dialog, Text } from '@/shared/ui';

import { BackupError, downloadBackup, parseBackup } from '../declaration/backup';
import type { DeclarationState } from '../declaration/declaration-state';
import { useDeclaration } from '../declaration/declaration-context';

type Pending = { state: DeclarationState; createdAt: string };

const ERRORS = {
  'not-a-backup':
    'Ese archivo no es una copia de Declara tu renta. Elige el .json que descargaste con «Descargar copia».',
  outdated: 'Esa copia es de una versión anterior de la plataforma y ya no se puede abrir.',
} as const;

/** "Copia" in the top bar: download the declaration as a .json file or open one (ADR 0027). */
export const CopyMenu = () => {
  const { state, dispatch } = useDeclaration();
  const { containerRef, isOpen, openModal, closeModal } = useModal<HTMLButtonElement>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setPending(parseBackup(await file.text()));
    } catch (caught) {
      setError(caught instanceof BackupError ? ERRORS[caught.reason] : ERRORS['not-a-backup']);
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
