import { useState } from 'react';
import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
  LuCalendar,
  LuCheck,
  LuCircleHelp,
  LuDownload,
  LuPanelBottom,
  LuTrash2,
  LuUpload,
} from 'react-icons/lu';
import { cn } from 'polpo/helpers';
import { Link } from 'react-router';

import { TAX_YEARS } from '@/domain/tax-years';
import { SummaryPlacementOptions } from '@/features/estimate/SummaryPlacementOptions';
import { Icon, Sheet, Text } from '@/shared/ui';

import { PRIVACY_PATH, TERMS_PATH } from '../flow';
import { useTaxYear } from '../declaration/tax-year-context';
import { useHelp } from '../help/help-context';

import { useMyData } from './my-data';

type MenuRowProps = {
  icon: IconType;
  title: string;
  help?: string;
  onClick: () => void;
  danger?: boolean;
  expanded?: boolean;
};

const MenuRow = ({ icon, title, help, onClick, danger = false, expanded }: MenuRowProps) => (
  <button
    type='button'
    onClick={onClick}
    aria-expanded={expanded}
    className='flex w-full cursor-pointer items-start gap-3 rounded-md py-2.5 text-left outline-none hover:bg-subtle focus-visible:ring-2 focus-visible:ring-line-action'
  >
    <Icon
      icon={icon}
      size={20}
      className={cn('mt-px shrink-0', danger ? 'text-fg-error' : 'text-fg-action')}
    />
    <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
      <Text as='span' variant='body-m-strong' className={danger ? 'text-fg-error' : undefined}>
        {title}
      </Text>
      {help && (
        <Text as='span' variant='note' className='text-fg-muted'>
          {help}
        </Text>
      )}
    </span>
  </button>
);

const Divider = () => <hr className='m-0 border-0 border-t border-line' />;

const Group = ({ label, children }: { label?: string; children: ReactNode }) => (
  <div className='flex flex-col gap-1'>
    {label && (
      <Text variant='caption' className='text-fg-secondary'>
        {label}
      </Text>
    )}
    {children}
  </div>
);

type MenuSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Figma M04b «Menú»: what the side rail and the top bar hold on a computer (tax year, «Mis datos»,
 * help and legal pages), for phones and tablets (ADR 0060).
 */
export const MenuSheet = ({ isOpen, onClose }: MenuSheetProps) => {
  const myData = useMyData();
  const { openHelp } = useHelp();
  const { taxYear, selectYear } = useTaxYear();
  const [choosingYear, setChoosingYear] = useState(false);
  const [choosingSummary, setChoosingSummary] = useState(false);

  return (
    <>
      <Sheet isOpen={isOpen} onClose={onClose} title='Menú'>
        <Group>
          <MenuRow
            icon={LuCalendar}
            title={`Año gravable ${String(taxYear.year)}`}
            help='Cambia el año de la declaración'
            expanded={choosingYear}
            onClick={() => {
              setChoosingYear(value => !value);
            }}
          />
          {choosingYear && (
            <ul className='flex flex-col gap-1 pl-8'>
              {TAX_YEARS.map(config => {
                const isSelected = config.year === taxYear.year;
                return (
                  <li key={config.year}>
                    <button
                      type='button'
                      aria-current={isSelected ? 'true' : undefined}
                      onClick={() => {
                        selectYear(config.year);
                        setChoosingYear(false);
                        onClose();
                      }}
                      className={cn(
                        'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-line-action',
                        isSelected ? 'bg-rail' : 'hover:bg-subtle',
                      )}
                    >
                      <Text as='span' variant='body-m' className='flex-1'>
                        Año gravable {config.year} · Se declara en {config.filingYear}
                      </Text>
                      {isSelected && <Icon icon={LuCheck} size={16} className='text-fg-action' />}
                    </button>
                  </li>
                );
              })}
              <li>
                <Text variant='note' className='px-3 text-fg-muted'>
                  Cada año guarda su propia declaración en este navegador.
                </Text>
              </li>
            </ul>
          )}
        </Group>
        <Divider />
        <Group label='Mis datos'>
          <MenuRow
            icon={LuDownload}
            title='Descargar datos'
            help='Guarda un archivo para seguir después o en otro computador'
            onClick={() => {
              myData.download();
              onClose();
            }}
          />
          <MenuRow
            icon={LuUpload}
            title='Cargar datos'
            help='Abre un archivo que descargaste antes y sigue donde ibas'
            onClick={() => {
              onClose();
              myData.load();
            }}
          />
          <MenuRow
            icon={LuTrash2}
            title='Reiniciar formulario'
            danger
            onClick={() => {
              onClose();
              myData.reset();
            }}
          />
        </Group>
        <Divider />
        <MenuRow
          icon={LuPanelBottom}
          title='Resumen de tu declaración'
          help='Elige dónde verlo mientras llenas los pasos'
          onClick={() => {
            onClose();
            setChoosingSummary(true);
          }}
        />
        <MenuRow
          icon={LuCircleHelp}
          title='Ayuda'
          help='Guía y preguntas frecuentes'
          onClick={() => {
            onClose();
            openHelp('guide');
          }}
        />
        <nav aria-label='Legal' className='flex items-center gap-2'>
          <Link to={TERMS_PATH} className='rounded-sm type-note text-fg-muted hover:text-fg-action'>
            Términos de uso
          </Link>
          <Text as='span' variant='note' className='text-fg-muted' aria-hidden>
            ·
          </Text>
          <Link to={PRIVACY_PATH} className='rounded-sm type-note text-fg-muted hover:text-fg-action'>
            Privacidad
          </Link>
        </nav>
      </Sheet>
      <Sheet
        isOpen={choosingSummary}
        onClose={() => {
          setChoosingSummary(false);
        }}
        title='Mostrar el resumen'
      >
        <SummaryPlacementOptions
          showLabel={false}
          onChange={() => {
            setChoosingSummary(false);
          }}
        />
      </Sheet>
      {myData.elements}
    </>
  );
};
