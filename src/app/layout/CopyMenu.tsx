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

/** Menu option with a small help line under its name. */
const MenuLabel = ({ title, help }: { title: string; help: string }) => (
  <span className='flex flex-col items-start gap-0.5 text-left'>
    <span>{title}</span>
    <Text as='span' variant='note' className='text-fg-muted'>
      {help}
    </Text>
  </span>
);

const ERRORS = {
  'not-a-backup':
    'Ese archivo no es de Declara tu renta. Elige el .json que descargaste con «Descargar datos».',
  outdated: 'Ese archivo es de una versión anterior de la plataforma y ya no se puede cargar.',
  'other-year': 'Ese archivo es de otro año gravable.',
} as const;

/**
 * «Mis datos» in the top bar: download the declaration as a .json file, load one (ADR 0027) or
 * reset the open year in this browser (ADR 0040). Names and help texts in ADR 0051.
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
          `Ese archivo es del año gravable ${String(caught.year)}. Cambia el año en «Año gravable» y cárgalo de nuevo.`,
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
        Mis datos
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
          label={
            <MenuLabel
              title='Descargar datos'
              help='Guarda un archivo para seguir después o en otro computador'
            />
          }
          onClick={() => {
            downloadBackup(state);
            closeModal();
          }}
        />
        <Menu.Option
          icon={LuUpload}
          label={
            <MenuLabel title='Cargar datos' help='Abre un archivo que descargaste antes y sigue donde ibas' />
          }
          onClick={() => {
            closeModal();
            inputRef.current?.click();
          }}
        />
        <Menu.Divider />
        <Menu.Option
          icon={LuTrash2}
          label='Reiniciar formulario'
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
          Se borra tu declaración del año gravable {String(taxYear.year)} guardada en este navegador y vuelves
          a empezar desde cero. Si quieres conservarla, descarga tus datos antes. No se puede deshacer.
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
  );
};
