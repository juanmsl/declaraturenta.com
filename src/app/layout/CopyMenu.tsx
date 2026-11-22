import { LuChevronDown, LuDownload, LuTrash2, LuUpload } from 'react-icons/lu';
import { Menu } from 'polpo/components';
import { useModal } from 'polpo/hooks';

import { Button, Text } from '@/shared/ui';

import { useMyData } from './my-data';

/** Menu option with a small help line under its name. */
const MenuLabel = ({ title, help }: { title: string; help: string }) => (
  <span className='flex flex-col items-start gap-0.5 text-left'>
    <span>{title}</span>
    <Text as='span' variant='note' className='text-fg-muted'>
      {help}
    </Text>
  </span>
);

/**
 * «Mis datos» in the top bar: download the declaration as a .json file, load one (ADR 0027) or
 * reset the open year in this browser (ADR 0040). Names and help texts in ADR 0051.
 */
export const CopyMenu = () => {
  const myData = useMyData();
  const { containerRef, isOpen, openModal, closeModal } = useModal<HTMLButtonElement>();

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
            myData.download();
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
            myData.load();
          }}
        />
        <Menu.Divider />
        <Menu.Option
          icon={LuTrash2}
          label='Reiniciar formulario'
          className='text-fg-error'
          onClick={() => {
            closeModal();
            myData.reset();
          }}
        />
      </Menu>
      {myData.elements}
    </>
  );
};
