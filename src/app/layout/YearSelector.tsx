import { LuCalendar, LuCheck, LuChevronDown } from 'react-icons/lu';
import { Menu } from 'polpo/components';
import { useModal } from 'polpo/hooks';

import { TAX_YEARS } from '@/domain/tax-years';
import { Icon, Text } from '@/shared/ui';

import { useTaxYear } from '../declaration/tax-year-context';

/** Figma "Selector de año" (screen 17): each taxable year keeps its own return (ADR 0034). */
export const YearSelector = () => {
  const { taxYear, selectYear } = useTaxYear();
  const { containerRef, isOpen, openModal, closeModal } = useModal<HTMLButtonElement>();

  return (
    <>
      <button
        ref={containerRef}
        type='button'
        onClick={openModal}
        aria-haspopup='menu'
        aria-expanded={isOpen}
        className='flex w-fit cursor-pointer items-center gap-2 rounded-full border border-line bg-surface py-1.5 pr-2.5 pl-2.5 outline-none hover:border-line-strong focus-visible:ring-2 focus-visible:ring-line-action'
      >
        <Icon icon={LuCalendar} size={14} className='text-fg-action' />
        <Text as='span' variant='caption' className='text-fg-secondary'>
          Año gravable {taxYear.year}
        </Text>
        <Icon icon={LuChevronDown} size={14} className='text-fg-muted' />
      </button>
      <Menu
        id='year-menu'
        isOpen={isOpen}
        onClose={closeModal}
        containerRef={containerRef}
        position='bottom left'
        backdrop='transparent'
      >
        {TAX_YEARS.map(config => (
          <Menu.Option
            key={config.year}
            icon={config.year === taxYear.year ? LuCheck : undefined}
            selected={config.year === taxYear.year}
            label={`Año gravable ${String(config.year)} · Se declara en ${String(config.filingYear)}`}
            onClick={() => {
              selectYear(config.year);
              closeModal();
            }}
          />
        ))}
        <Menu.Divider />
        <li className='max-w-64 px-3 py-2'>
          <Text variant='note' className='text-fg-muted'>
            Cada año guarda su propia declaración en este navegador.
          </Text>
        </li>
      </Menu>
    </>
  );
};
